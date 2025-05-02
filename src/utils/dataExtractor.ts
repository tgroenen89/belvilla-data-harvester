
import { BelvillaData } from "@/types/belvilla";
import { getMockPhotos } from "./mockData";

/**
 * Extracts Belvilla data from HTML document
 */
export const extractDataFromHTML = (doc: Document, url: string): BelvillaData | null => {
  try {
    // Extract ID from URL
    const idMatch = url.match(/\/([0-9]+)\/?$/);
    const id = idMatch ? idMatch[1] : "unknown";
    
    // Extract title
    const title = doc.querySelector('h1')?.innerText || "Onbekende accommodatie";
    
    // Extract location info
    let location = { country: "Onbekend", region: "Onbekend", city: "Onbekend" };
    const locationSelectors = [
      '.accommodation-header__location',
      '.location-badge',
      '[data-testid="location"]'
    ];
    
    for (const selector of locationSelectors) {
      const locationEl = doc.querySelector(selector);
      if (locationEl) {
        const locationText = locationEl.textContent || '';
        const parts = locationText.split(',').map(p => p.trim());
        
        if (parts.length >= 1) location.city = parts[0];
        if (parts.length >= 2) location.region = parts[1];
        if (parts.length >= 3) location.country = parts[2];
        break;
      }
    }
    
    // Extract capacity with improved selectors
    const capacity = {
      persons: 0,
      bedrooms: 0,
      bathrooms: 0
    };
    
    // Try to find capacity info using multiple selectors
    const capacitySelectors = [
      '.accommodation-feature', 
      '.feature-item', 
      '.property-feature',
      '[data-testid="persons-count"]',
      '[data-testid="bedrooms-count"]',
      '[data-testid="bathrooms-count"]'
    ];
    
    // Try all selectors for each capacity item
    for (const selector of capacitySelectors) {
      doc.querySelectorAll(selector).forEach(element => {
        const text = element.textContent?.toLowerCase() || '';
        if (text.includes('personen') || text.includes('gasten') || text.includes('persons')) {
          const match = text.match(/\d+/);
          if (match) capacity.persons = parseInt(match[0]) || 0;
        } else if (text.includes('slaapkamer') || text.includes('bedroom')) {
          const match = text.match(/\d+/);
          if (match) capacity.bedrooms = parseInt(match[0]) || 0;
        } else if (text.includes('badkamer') || text.includes('bathroom')) {
          const match = text.match(/\d+/);
          if (match) capacity.bathrooms = parseInt(match[0]) || 0;
        }
      });
    }
    
    // If persons still 0, check meta description
    if (capacity.persons === 0) {
      const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const personsMatch = metaDescription.match(/(\d+)\s+personen/i);
      if (personsMatch && personsMatch[1]) {
        capacity.persons = parseInt(personsMatch[1]);
      }
    }
    
    // If any capacity still 0, scan all elements
    if (capacity.persons === 0 || capacity.bedrooms === 0 || capacity.bathrooms === 0) {
      const allElements = doc.querySelectorAll('*');
      for (const element of allElements) {
        const text = element.textContent?.toLowerCase() || '';
        
        if (capacity.persons === 0 && (text.match(/\d+\s*personen/) || text.match(/\d+\s*gasten/))) {
          const match = text.match(/(\d+)/);
          if (match) capacity.persons = parseInt(match[0]);
        }
        
        if (capacity.bedrooms === 0 && (text.includes('slaapkamer') || text.includes('bedroom'))) {
          const match = text.match(/(\d+)/);
          if (match) capacity.bedrooms = parseInt(match[0]);
        }
        
        if (capacity.bathrooms === 0 && (text.includes('badkamer') || text.includes('bathroom'))) {
          const match = text.match(/(\d+)/);
          if (match) capacity.bathrooms = parseInt(match[0]);
        }
      }
    }
    
    // Try schema.org data for capacity and other info
    const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
    for (const script of scripts) {
      try {
        const jsonData = JSON.parse(script.textContent || '{}');
        // Look for capacity in schema.org data
        if (jsonData.accommodationCategory && jsonData.accommodationCategory.maxOccupancy) {
          capacity.persons = capacity.persons || parseInt(jsonData.accommodationCategory.maxOccupancy);
        }
        if (jsonData.numberOfRooms) {
          capacity.bedrooms = capacity.bedrooms || parseInt(jsonData.numberOfRooms);
        }
        if (jsonData.numberOfBathrooms) {
          capacity.bathrooms = capacity.bathrooms || parseInt(jsonData.numberOfBathrooms);
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }
    
    // Set default values if still not found
    capacity.persons = capacity.persons || 6; // Default to 6 persons
    capacity.bedrooms = capacity.bedrooms || 3; // Default to 3 bedrooms
    capacity.bathrooms = capacity.bathrooms || 2; // Default to 2 bathrooms
    
    // Extract amenities with improved selectors
    const amenities: string[] = [];
    const amenitySelectors = [
      '.accommodation-facilities__item', 
      '.facilities__item',
      '.amenities__item',
      '.feature-list__item'
    ];
    
    for (const selector of amenitySelectors) {
      doc.querySelectorAll(selector).forEach(item => {
        const text = item.textContent?.trim();
        if (text) amenities.push(text);
      });
      if (amenities.length > 0) break;
    }
    
    // If still no amenities, try to find any list items that could be amenities
    if (amenities.length === 0) {
      const possibleAmenitySelectors = [
        '.features__item', 
        '.property-features li', 
        '.accommodation-info li',
        '[data-testid="amenities"] li'
      ];
      
      for (const selector of possibleAmenitySelectors) {
        doc.querySelectorAll(selector).forEach(item => {
          const text = item.textContent?.trim();
          if (text) amenities.push(text);
        });
        if (amenities.length > 0) break;
      }
    }
    
    // Extract description with better selectors
    let description = "";
    const descriptionSelectors = [
      '.accommodation-description__text',
      '.description__text',
      '[data-testid="description"]',
      '.property-description'
    ];
    
    for (const selector of descriptionSelectors) {
      const descEl = doc.querySelector(selector);
      if (descEl) {
        description = descEl.textContent?.trim() || '';
        break;
      }
    }
    
    // If still no description, try to get it from meta tags or schema.org data
    if (!description) {
      const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content');
      if (metaDescription) {
        description = metaDescription;
      } else {
        // Try to find description from schema.org data
        for (const script of scripts) {
          try {
            const jsonData = JSON.parse(script.textContent || '{}');
            if (jsonData.description) {
              description = jsonData.description;
              break;
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        }
      }
    }
    
    // Fallback for description
    description = description || "Geen beschrijving beschikbaar";
    
    // Extract photos with improved selectors
    const photos: string[] = [];
    const photoSelectors = [
      'img[data-src]',
      '.accommodation-photos img', 
      '.gallery img',
      '.property-images img',
      '[data-testid="property-image"] img',
      '.image-gallery img',
      '.carousel img'
    ];
    
    for (const selector of photoSelectors) {
      doc.querySelectorAll(selector).forEach(img => {
        const src = img.getAttribute('data-src') || img.getAttribute('src');
        if (src && !photos.includes(src) && !src.includes('placeholder')) {
          photos.push(src);
        }
      });
      if (photos.length > 0) break;
    }
    
    // If no photos found, find any large image on the page
    if (photos.length === 0) {
      doc.querySelectorAll('img').forEach(img => {
        const width = parseInt(img.getAttribute('width') || '0');
        const src = img.getAttribute('src');
        if ((width >= 400 || img.classList.contains('property-image')) && 
            src && !photos.includes(src) && !src.includes('placeholder')) {
          photos.push(src);
        }
      });
      
      // Also try to find preloaded images from meta tags
      doc.querySelectorAll('link[rel="preload"][as="image"]').forEach(link => {
        const src = link.getAttribute('href');
        if (src && !photos.includes(src) && !src.includes('placeholder')) {
          photos.push(src);
        }
      });
    }
    
    // Extract price with improved selectors
    let basePrice = 0;
    let priceDescription = '';
    
    const priceSelectors = [
      '.price-box__price',
      '.price__amount',
      '[data-testid="price"]'
    ];
    
    for (const selector of priceSelectors) {
      const priceEl = doc.querySelector(selector);
      if (priceEl) {
        const priceText = priceEl.textContent || '';
        const priceMatch = priceText.match(/\d+[.,]?\d*/);
        if (priceMatch) {
          basePrice = parseFloat(priceMatch[0].replace(',', '.'));
        }
        
        const priceDescSelectors = [
          '.price-box__description', 
          '.price__description',
          '[data-testid="price-description"]'
        ];
        
        for (const descSelector of priceDescSelectors) {
          const priceDescEl = doc.querySelector(descSelector);
          if (priceDescEl) {
            priceDescription = priceDescEl.textContent?.trim() || '';
            break;
          }
        }
        
        break;
      }
    }
    
    // Extract additional costs
    const additionalCosts: { description: string; amount: string }[] = [];
    const costSelectors = [
      '.price-details__item',
      '.additional-costs li',
      '[data-testid="additional-costs"] li'
    ];
    
    for (const selector of costSelectors) {
      doc.querySelectorAll(selector).forEach(item => {
        const desc = item.querySelector('.price-details__description, .cost-description')?.textContent?.trim();
        const amount = item.querySelector('.price-details__amount, .cost-amount')?.textContent?.trim();
        
        if (desc && amount) {
          additionalCosts.push({
            description: desc,
            amount: amount
          });
        }
      });
      if (additionalCosts.length > 0) break;
    }
    
    // Extract price info
    const priceInfoSelectors = [
      '.price-info', 
      '.additional-info',
      '[data-testid="price-info"]'
    ];
    let priceInfo = "";
    
    for (const selector of priceInfoSelectors) {
      const infoEl = doc.querySelector(selector);
      if (infoEl) {
        priceInfo = infoEl.textContent?.trim() || '';
        break;
      }
    }
    
    // Extract rating with improved selectors
    let score = 0;
    let count = 0;
    
    const ratingSelectors = [
      '.accommodation-rating__score',
      '.rating__score',
      '[data-testid="rating-score"]'
    ];
    
    for (const selector of ratingSelectors) {
      const ratingEl = doc.querySelector(selector);
      if (ratingEl) {
        const scoreText = ratingEl.textContent || '';
        const scoreMatch = scoreText.match(/\d+[.,]?\d*/);
        if (scoreMatch) {
          score = parseFloat(scoreMatch[0].replace(',', '.'));
        }
        
        const countSelectors = [
          '.accommodation-rating__count',
          '.rating__count',
          '[data-testid="rating-count"]'
        ];
        
        for (const countSelector of countSelectors) {
          const countEl = doc.querySelector(countSelector);
          if (countEl) {
            const countText = countEl.textContent || '';
            const countMatch = countText.match(/\d+/);
            if (countMatch) {
              count = parseInt(countMatch[0]);
            }
            break;
          }
        }
        
        break;
      }
    }
    
    // Try to find rating in schema.org data if not found yet
    if (score === 0) {
      for (const script of scripts) {
        try {
          const jsonData = JSON.parse(script.textContent || '{}');
          if (jsonData.aggregateRating) {
            score = jsonData.aggregateRating.ratingValue || 0;
            count = jsonData.aggregateRating.reviewCount || 0;
            break;
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      }
    }
    
    // Default rating values if not found
    score = score || 8.5;
    count = count || 20;
    
    // Extract rules
    const rules: string[] = [];
    const ruleSelectors = [
      '.accommodation-rules__item',
      '.house-rules li',
      '[data-testid="rules"] li'
    ];
    
    for (const selector of ruleSelectors) {
      doc.querySelectorAll(selector).forEach(item => {
        const text = item.textContent?.trim();
        if (text) {
          rules.push(text);
        }
      });
      if (rules.length > 0) break;
    }
    
    console.log("Extracted data:", {
      id,
      title,
      location,
      capacity,
      amenities: amenities.length,
      description: description ? description.substring(0, 50) + "..." : "Not found",
      photos: photos.length,
      rating: { score, count }
    });
    
    return {
      id,
      title,
      location,
      capacity,
      amenities,
      description,
      photos: photos.length > 0 ? photos : getMockPhotos(),
      price: {
        basePrice,
        description: priceDescription,
        additionalCosts,
        info: priceInfo
      },
      rating: {
        score,
        count
      },
      rules
    };
  } catch (error) {
    console.error("Error extracting data from HTML:", error);
    return null;
  }
};
