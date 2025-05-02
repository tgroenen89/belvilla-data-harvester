
// This script runs directly on Belvilla pages
console.log("Belvilla Data Harvester content script loaded");

// Function to extract data from the current page
function extractBelvillaData() {
  try {
    // Extract the accommodation ID from URL
    const url = window.location.href;
    const idMatch = url.match(/\/([0-9]+)\/?$/);
    const id = idMatch ? idMatch[1] : "";
    
    // Extract title
    const title = document.querySelector('h1')?.innerText || "";
    
    // Extract location data with improved selectors
    let location = { city: "", region: "", country: "" };
    
    const locationSelectors = [
      '.accommodation-header__location', 
      '.location-badge',
      '[data-testid="location"]',
      '.property-location'
    ];
    
    for (const selector of locationSelectors) {
      const locationEl = document.querySelector(selector);
      if (locationEl) {
        const locationText = locationEl.innerText.trim();
        const parts = locationText.split(',').map(part => part.trim());
        
        if (parts.length >= 1) location.city = parts[0] || "";
        if (parts.length >= 2) location.region = parts[1] || "";
        if (parts.length >= 3) location.country = parts[2] || "";
        break;
      }
    }
    
    // Try to extract location from meta tags if not found
    if (!location.city) {
      const metaTags = document.querySelectorAll('meta[property^="og:"]');
      metaTags.forEach(tag => {
        const content = tag.getAttribute('content') || '';
        if (tag.getAttribute('property') === 'og:locality' && content) {
          location.city = content;
        } else if (tag.getAttribute('property') === 'og:region' && content) {
          location.region = content;
        } else if (tag.getAttribute('property') === 'og:country-name' && content) {
          location.country = content;
        }
      });
    }
    
    // Extract capacity information with multiple approaches
    let persons = 0, bedrooms = 0, bathrooms = 0;
    
    // First try to find capacity info using multiple selectors
    const capacitySelectors = [
      '.accommodation-feature', 
      '.feature-item', 
      '.property-feature',
      '[data-testid="persons-count"]',
      '[data-testid="bedrooms-count"]',
      '[data-testid="bathrooms-count"]',
      '.feature-list__item'
    ];
    
    // Try all selectors
    for (const selector of capacitySelectors) {
      document.querySelectorAll(selector).forEach(element => {
        const text = element.innerText.toLowerCase();
        if (text.includes('personen') || text.includes('gasten') || text.includes('persons')) {
          const match = text.match(/\d+/);
          if (match) persons = parseInt(match[0]) || 0;
        } else if (text.includes('slaapkamer') || text.includes('bedroom')) {
          const match = text.match(/\d+/);
          if (match) bedrooms = parseInt(match[0]) || 0;
        } else if (text.includes('badkamer') || text.includes('bathroom')) {
          const match = text.match(/\d+/);
          if (match) bathrooms = parseInt(match[0]) || 0;
        }
      });
    }
    
    // Try to scan all elements with certain classes that might contain capacity info
    const possibleCapacityContainers = [
      '.features',
      '.accommodation-features',
      '.property-details',
      '.details-container'
    ];
    
    if (persons === 0 || bedrooms === 0 || bathrooms === 0) {
      for (const selector of possibleCapacityContainers) {
        const container = document.querySelector(selector);
        if (container) {
          const text = container.innerText.toLowerCase();
          
          if (persons === 0) {
            const personsMatch = text.match(/(\d+)\s*(personen|gasten|persons)/i);
            if (personsMatch) persons = parseInt(personsMatch[1]) || 0;
          }
          
          if (bedrooms === 0) {
            const bedroomsMatch = text.match(/(\d+)\s*(slaapkamer|bedroom)/i);
            if (bedroomsMatch) bedrooms = parseInt(bedroomsMatch[1]) || 0;
          }
          
          if (bathrooms === 0) {
            const bathroomsMatch = text.match(/(\d+)\s*(badkamer|bathroom)/i);
            if (bathroomsMatch) bathrooms = parseInt(bathroomsMatch[1]) || 0;
          }
        }
      }
    }
    
    // If persons still 0, check meta description
    if (persons === 0) {
      const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const personsMatch = metaDescription.match(/(\d+)\s+personen/i);
      if (personsMatch && personsMatch[1]) {
        persons = parseInt(personsMatch[1]);
      }
    }
    
    // Check JSON-LD data for capacity information
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach(script => {
      try {
        const jsonData = JSON.parse(script.textContent || '{}');
        
        // Look for Schema.org data
        if (jsonData.numberOfGuests) {
          persons = persons || parseInt(jsonData.numberOfGuests);
        }
        if (jsonData.numberOfRooms) {
          bedrooms = bedrooms || parseInt(jsonData.numberOfRooms);
        }
        if (jsonData.numberOfBathrooms) {
          bathrooms = bathrooms || parseInt(jsonData.numberOfBathrooms);
        }
        
        // Also check nested accommodationCategory
        if (jsonData.accommodationCategory && jsonData.accommodationCategory.maxOccupancy) {
          persons = persons || parseInt(jsonData.accommodationCategory.maxOccupancy);
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    });
    
    // No default values if still not found
    
    // Extract amenities with improved selectors
    const amenities = [];
    const amenitySelectors = [
      '.accommodation-facilities__item', 
      '.facilities__item',
      '.amenities__item',
      '.feature-list__item',
      '.features li',
      '.amenities li'
    ];
    
    for (const selector of amenitySelectors) {
      document.querySelectorAll(selector).forEach(item => {
        const text = item.innerText.trim();
        if (text && !amenities.includes(text)) amenities.push(text);
      });
      if (amenities.length > 0) break;
    }
    
    // Extract description with better selectors
    let description = "";
    const descriptionSelectors = [
      '.accommodation-description__text',
      '.description__text',
      '[data-testid="description"]',
      '.property-description',
      '.description',
      '.accommodation-description'
    ];
    
    for (const selector of descriptionSelectors) {
      const descEl = document.querySelector(selector);
      if (descEl) {
        description = descEl.innerText.trim();
        break;
      }
    }
    
    // If still no description, try to get it from meta tags
    if (!description) {
      description = document.querySelector('meta[name="description"]')?.getAttribute('content') || 
                   document.querySelector('meta[property="og:description"]')?.getAttribute('content') || 
                   "";
    }
    
    // Extract photos with improved selectors
    const photos = [];
    const photoSelectors = [
      '.accommodation-photos img', 
      '.gallery img',
      '.property-images img',
      '[data-testid="property-image"] img',
      '.carousel img',
      '.gallery__image'
    ];
    
    for (const selector of photoSelectors) {
      document.querySelectorAll(selector).forEach(img => {
        const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
        if (src && !photos.includes(src) && !src.includes('placeholder')) {
          photos.push(src);
        }
      });
    }
    
    // Also try to get photos from data-srcset or srcset attributes
    if (photos.length === 0) {
      document.querySelectorAll('img[data-srcset], img[srcset]').forEach(img => {
        const srcset = img.getAttribute('data-srcset') || img.getAttribute('srcset');
        if (srcset) {
          const firstSrc = srcset.split(',')[0].trim().split(' ')[0];
          if (firstSrc && !photos.includes(firstSrc) && !firstSrc.includes('placeholder')) {
            photos.push(firstSrc);
          }
        }
      });
    }
    
    // Extract price information with improved selectors
    let basePrice = 0;
    const priceSelectors = [
      '.price-box__price',
      '.price__amount',
      '[data-testid="price"]',
      '.price',
      '.property-price'
    ];
    
    for (const selector of priceSelectors) {
      const priceElement = document.querySelector(selector);
      if (priceElement) {
        const priceText = priceElement.innerText.replace(/[^0-9,\.]/g, '').replace(',', '.');
        basePrice = parseFloat(priceText) || 0;
        break;
      }
    }
    
    // Look for price in JSON-LD data if not found
    if (basePrice === 0) {
      scripts.forEach(script => {
        try {
          const jsonData = JSON.parse(script.textContent || '{}');
          if (jsonData.priceRange) {
            const priceText = jsonData.priceRange.replace(/[^0-9,\.]/g, '').replace(',', '.');
            basePrice = parseFloat(priceText) || 0;
          } else if (jsonData.offers && jsonData.offers.price) {
            basePrice = parseFloat(jsonData.offers.price) || 0;
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      });
    }
    
    const priceDescription = document.querySelector('.price-box__description, .price__description, [data-testid="price-description"]')?.innerText || "";
    
    // Extract additional costs with improved selectors
    const additionalCosts = [];
    const costSelectors = [
      '.price-details__item',
      '.additional-costs li',
      '[data-testid="additional-costs"] li',
      '.extra-costs li'
    ];
    
    for (const selector of costSelectors) {
      document.querySelectorAll(selector).forEach(item => {
        const description = item.querySelector('.price-details__description, .cost-description')?.innerText || "";
        const amount = item.querySelector('.price-details__amount, .cost-amount')?.innerText || "";
        if (description && amount) {
          additionalCosts.push({ description, amount });
        }
      });
      if (additionalCosts.length > 0) break;
    }
    
    const priceInfoSelectors = ['.price-info', '.additional-info', '[data-testid="price-info"]', '.price-notes'];
    let priceInfo = "";
    
    for (const selector of priceInfoSelectors) {
      const infoEl = document.querySelector(selector);
      if (infoEl) {
        priceInfo = infoEl.innerText.trim();
        break;
      }
    }
    
    // Extract rating with improved selectors
    let score = 0, count = 0;
    const ratingSelectors = [
      '.accommodation-rating__score',
      '.rating__score',
      '[data-testid="rating-score"]',
      '.rating-score',
      '.property-rating'
    ];
    
    for (const selector of ratingSelectors) {
      const ratingElement = document.querySelector(selector);
      if (ratingElement) {
        const scoreText = ratingElement.innerText.trim();
        const scoreMatch = scoreText.match(/\d+[.,]?\d*/);
        if (scoreMatch) {
          score = parseFloat(scoreMatch[0].replace(',', '.')) || 0;
        }
        
        const countSelectors = [
          '.accommodation-rating__count',
          '.rating__count',
          '[data-testid="rating-count"]',
          '.rating-count',
          '.reviews-count'
        ];
        
        for (const countSelector of countSelectors) {
          const countElement = document.querySelector(countSelector);
          if (countElement) {
            const countText = countElement.innerText.trim();
            const countMatch = countText.match(/\d+/);
            count = countMatch ? parseInt(countMatch[0]) : 0;
            break;
          }
        }
        
        break;
      }
    }
    
    // Check JSON-LD for rating info if not found
    if (score === 0) {
      scripts.forEach(script => {
        try {
          const jsonData = JSON.parse(script.textContent || '{}');
          if (jsonData.aggregateRating) {
            score = parseFloat(jsonData.aggregateRating.ratingValue) || 0;
            count = parseInt(jsonData.aggregateRating.reviewCount) || 0;
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      });
    }
    
    // No default rating values
    
    // Extract rules with improved selectors
    const rules = [];
    const ruleSelectors = [
      '.accommodation-rules__item',
      '.house-rules li',
      '[data-testid="rules"] li',
      '.rules li',
      '.property-rules li'
    ];
    
    for (const selector of ruleSelectors) {
      document.querySelectorAll(selector).forEach(item => {
        const text = item.innerText.trim();
        if (text) rules.push(text);
      });
      if (rules.length > 0) break;
    }
    
    console.log("Extracted data:", {
      id, 
      title, 
      location, 
      capacity: { persons, bedrooms, bathrooms },
      amenities: amenities.length,
      description: description ? "Found" : "Not found",
      photos: photos.length,
      rating: { score, count }
    });
    
    return {
      id,
      title,
      location,
      capacity: { persons, bedrooms, bathrooms },
      amenities,
      description,
      photos,
      price: {
        basePrice,
        description: priceDescription,
        additionalCosts,
        info: priceInfo
      },
      rating: { score, count },
      rules
    };
  } catch (error) {
    console.error("Error extracting data:", error);
    return null;
  }
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extractData") {
    console.log("Extracting data from Belvilla page");
    const data = extractBelvillaData();
    sendResponse(data);
  }
});
