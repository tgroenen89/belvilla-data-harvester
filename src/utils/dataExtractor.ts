import { BelvillaData } from "@/types/belvilla";
import { getMockPhotos } from "./mockData";

/**
 * Extracts Belvilla data from HTML document
 */
export const extractDataFromHTML = (doc: Document, url: string): BelvillaData | null => {
  try {
    // Extract ID from URL
    const idMatch = url.match(/\/([0-9]+)\/?$/);
    const id = idMatch ? idMatch[1] : "";
    
    // Extract title
    const title = doc.querySelector('h1')?.textContent || "";
    
    // Extract location info with improved selectors
    let location = { country: "", region: "", city: "" };
    const locationSelectors = [
      '.accommodation-header__location',
      '.location-badge',
      '[data-testid="location"]',
      '.property-location',
      '.location'
    ];
    
    for (const selector of locationSelectors) {
      const locationEl = doc.querySelector(selector);
      if (locationEl) {
        const locationText = locationEl.textContent || '';
        const parts = locationText.split(',').map(p => p.trim());
        
        if (parts.length >= 1) location.city = parts[0] || "";
        if (parts.length >= 2) location.region = parts[1] || "";
        if (parts.length >= 3) location.country = parts[2] || "";
        break;
      }
    }
    
    // Try to extract location from meta tags if not found
    if (!location.city) {
      doc.querySelectorAll('meta[property^="og:"]').forEach(tag => {
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
    
    // Extract capacity with improved selectors
    const capacity = {
      persons: 0,
      bedrooms: 0,
      bathrooms: 0,
      area: 0,
      type: ""
    };
    
    // Look for highlighted features section
    const highlightedFeatures = doc.querySelector('.uitgelicht, .highlighted-features, .summary-features');
    if (highlightedFeatures) {
      const featureText = highlightedFeatures.textContent?.toLowerCase() || '';
      
      // Try to find specific patterns for each feature
      const personsMatch = featureText.match(/(\d+)\s*(gasten|personen|personnes|guests)/i);
      if (personsMatch) capacity.persons = parseInt(personsMatch[1]) || 0;
      
      const bedroomsMatch = featureText.match(/(\d+)\s*(slaapkamer|chambre|bedroom)/i);
      if (bedroomsMatch) capacity.bedrooms = parseInt(bedroomsMatch[1]) || 0;
      
      const bathroomsMatch = featureText.match(/(\d+)\s*(badkamer|salle de bain|bathroom)/i);
      if (bathroomsMatch) capacity.bathrooms = parseInt(bathroomsMatch[1]) || 0;
      
      const areaMatch = featureText.match(/(\d+[.,]?\d*)\s*m[²2]/i);
      if (areaMatch) capacity.area = parseFloat(areaMatch[1].replace(',', '.')) || 0;
      
      const typeMatch = featureText.match(/(tent lodge|lodge|cabin|chalet|apartment|appartement|villa|cottage)/i);
      if (typeMatch) capacity.type = typeMatch[1];
    }
    
    // If not found in highlighted features, try other selectors
    // Try to find capacity info using multiple selectors
    if (capacity.persons === 0 || capacity.bedrooms === 0 || capacity.bathrooms === 0) {
      // Try to find capacity info using multiple selectors
      const capacitySelectors = [
        '.accommodation-feature', 
        '.feature-item', 
        '.property-feature',
        '[data-testid="persons-count"]',
        '[data-testid="bedrooms-count"]',
        '[data-testid="bathrooms-count"]',
        '.feature-list__item',
        '.features li'
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
      
      // Try to scan specific containers for capacity info
      const possibleCapacityContainers = [
        '.features',
        '.accommodation-features',
        '.property-details',
        '.details-container'
      ];
      
      if (capacity.persons === 0 || capacity.bedrooms === 0 || capacity.bathrooms === 0) {
        for (const selector of possibleCapacityContainers) {
          const container = doc.querySelector(selector);
          if (container) {
            const text = container.textContent?.toLowerCase() || '';
            
            if (capacity.persons === 0) {
              const personsMatch = text.match(/(\d+)\s*(personen|gasten|persons)/i);
              if (personsMatch) capacity.persons = parseInt(personsMatch[1]) || 0;
            }
            
            if (capacity.bedrooms === 0) {
              const bedroomsMatch = text.match(/(\d+)\s*(slaapkamer|bedroom)/i);
              if (bedroomsMatch) capacity.bedrooms = parseInt(bedroomsMatch[1]) || 0;
            }
            
            if (capacity.bathrooms === 0) {
              const bathroomsMatch = text.match(/(\d+)\s*(badkamer|bathroom)/i);
              if (bathroomsMatch) capacity.bathrooms = parseInt(bathroomsMatch[1]) || 0;
            }
          }
        }
      }
      
      // Add extraction for area and type
      const areaSelectors = [
        '[data-testid="area"]',
        '.area',
        '[class*="area"]',
        '.property-size'
      ];
      
      for (const selector of areaSelectors) {
        const areaEl = doc.querySelector(selector);
        if (areaEl) {
          const text = areaEl.textContent?.toLowerCase() || '';
          const match = text.match(/(\d+[.,]?\d*)\s*m[²2]/);
          if (match) {
            capacity.area = parseFloat(match[1].replace(',', '.')) || 0;
            break;
          }
        }
      }
      
      const typeSelectors = [
        '[data-testid="accommodation-type"]',
        '.accommodation-type',
        '.property-type'
      ];
      
      for (const selector of typeSelectors) {
        const typeEl = doc.querySelector(selector);
        if (typeEl) {
          capacity.type = typeEl.textContent?.trim() || '';
          break;
        }
      }
    }
    
    // Try to scan specific containers for capacity info
    if (capacity.persons === 0 || capacity.bedrooms === 0 || capacity.bathrooms === 0) {
      for (const selector of possibleCapacityContainers) {
        const container = doc.querySelector(selector);
        if (container) {
          const text = container.textContent?.toLowerCase() || '';
          
          if (capacity.persons === 0) {
            const personsMatch = text.match(/(\d+)\s*(personen|gasten|persons)/i);
            if (personsMatch) capacity.persons = parseInt(personsMatch[1]) || 0;
          }
          
          if (capacity.bedrooms === 0) {
            const bedroomsMatch = text.match(/(\d+)\s*(slaapkamer|bedroom)/i);
            if (bedroomsMatch) capacity.bedrooms = parseInt(bedroomsMatch[1]) || 0;
          }
          
          if (capacity.bathrooms === 0) {
            const bathroomsMatch = text.match(/(\d+)\s*(badkamer|bathroom)/i);
            if (bathroomsMatch) capacity.bathrooms = parseInt(bathroomsMatch[1]) || 0;
          }
        }
      }
    }
    
    // If persons still 0, check meta description
    if (capacity.persons === 0) {
      const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const personsMatch = metaDescription.match(/(\d+)\s+personen/i);
      if (personsMatch && personsMatch[1]) {
        capacity.persons = parseInt(personsMatch[1]);
      }
    }
    
    // Try schema.org data for capacity and other info
    const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
    for (const script of scripts) {
      try {
        const jsonData = JSON.parse(script.textContent || '{}');
        
        // Look for capacity in schema.org data
        if (jsonData.numberOfGuests) {
          capacity.persons = capacity.persons || parseInt(jsonData.numberOfGuests);
        }
        if (jsonData.numberOfRooms) {
          capacity.bedrooms = capacity.bedrooms || parseInt(jsonData.numberOfRooms);
        }
        if (jsonData.numberOfBathrooms) {
          capacity.bathrooms = capacity.bathrooms || parseInt(jsonData.numberOfBathrooms);
        }
        if (jsonData.floorSize && jsonData.floorSize.value) {
          capacity.area = capacity.area || parseFloat(jsonData.floorSize.value);
        }
        if (jsonData.accommodationType) {
          capacity.type = capacity.type || jsonData.accommodationType;
        }
        
        // Also check nested accommodationCategory
        if (jsonData.accommodationCategory) {
          if (jsonData.accommodationCategory.maxOccupancy) {
            capacity.persons = capacity.persons || parseInt(jsonData.accommodationCategory.maxOccupancy);
          }
          if (jsonData.accommodationCategory.name) {
            capacity.type = capacity.type || jsonData.accommodationCategory.name;
          }
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }
    
    // No default values for capacity anymore
    
    // Extract amenities with improved selectors
    const amenities: string[] = [];
    const amenitySelectors = [
      '.accommodation-facilities__item', 
      '.facilities__item',
      '.amenities__item',
      '.feature-list__item',
      '.features li',
      '.amenities li'
    ];
    
    for (const selector of amenitySelectors) {
      doc.querySelectorAll(selector).forEach(item => {
        const text = item.textContent?.trim();
        if (text && !amenities.includes(text)) amenities.push(text);
      });
      if (amenities.length > 0) break;
    }
    
    // If still no amenities, try to find any list items that could be amenities
    if (amenities.length === 0) {
      const possibleAmenitySelectors = [
        '.features__item', 
        '.property-features li', 
        '.accommodation-info li',
        '[data-testid="amenities"] li',
        '.facilities ul li'
      ];
      
      for (const selector of possibleAmenitySelectors) {
        doc.querySelectorAll(selector).forEach(item => {
          const text = item.textContent?.trim();
          if (text && !amenities.includes(text)) amenities.push(text);
        });
        if (amenities.length > 0) break;
      }
    }
    
    // No default amenities
    
    // Extract description with better selectors
    let description = "";
    const descriptionSelectors = [
      '.accommodation-description__text',
      '.description__text',
      '[data-testid="description"]',
      '.property-description',
      '.description',
      '.accommodation-description',
      '[id*="description"]'
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
      const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
                             doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
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
    
    // No fallback for description
    
    // Extract photos with improved selectors
    const photos: string[] = [];
    const photoSelectors = [
      'img[data-src]',
      '.accommodation-photos img', 
      '.gallery img',
      '.property-images img',
      '[data-testid="property-image"] img',
      '.image-gallery img',
      '.carousel img',
      '.gallery__image',
      'img[srcset]',
      'img[data-srcset]'
    ];
    
    for (const selector of photoSelectors) {
      doc.querySelectorAll(selector).forEach(img => {
        let src = img.getAttribute('data-src') || 
                 img.getAttribute('src') || 
                 img.getAttribute('data-lazy-src');
        
        // Try to extract from srcset if no direct src
        if (!src) {
          const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset');
          if (srcset) {
            src = srcset.split(',')[0].trim().split(' ')[0];
          }
        }
        
        // Add photo if it's valid and not already in the array
        if (src && !photos.includes(src) && 
            !src.includes('placeholder') && 
            src.includes('http') &&
            (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png') || src.includes('.webp'))) {
          photos.push(src);
        }
      });
      if (photos.length > 0) break;
    }
    
    // Try to find preloaded images from meta tags
    if (photos.length === 0) {
      doc.querySelectorAll('link[rel="preload"][as="image"]').forEach(link => {
        const src = link.getAttribute('href');
        if (src && !photos.includes(src) && !src.includes('placeholder')) {
          photos.push(src);
        }
      });
      
      // Also check OpenGraph image tags
      doc.querySelectorAll('meta[property="og:image"]').forEach(meta => {
        const src = meta.getAttribute('content');
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
      '[data-testid="price"]',
      '.price',
      '.property-price',
      '[class*="price"]'
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
          '[data-testid="price-description"]',
          '.price-info',
          '.price-details'
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
    
    // Try schema.org data for price
    if (basePrice === 0) {
      for (const script of scripts) {
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
      }
    }
    
    // No default price
    
    // Extract additional costs
    const additionalCosts: { description: string; amount: string }[] = [];
    const costSelectors = [
      '.price-details__item',
      '.additional-costs li',
      '[data-testid="additional-costs"] li',
      '.extra-costs li'
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
      '[data-testid="price-info"]',
      '.price-notes'
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
      '[data-testid="rating-score"]',
      '.rating-score',
      '.property-rating',
      '[class*="rating"]'
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
          '[data-testid="rating-count"]',
          '.rating-count',
          '.reviews-count'
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
            score = parseFloat(jsonData.aggregateRating.ratingValue) || 0;
            count = parseInt(jsonData.aggregateRating.reviewCount) || 0;
            break;
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      }
    }
    
    // No default rating values
    
    // Extract rules
    const rules: string[] = [];
    const ruleSelectors = [
      '.accommodation-rules__item',
      '.house-rules li',
      '[data-testid="rules"] li',
      '.rules li',
      '.property-rules li'
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
    
    // No default rules
    
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
    
    // Update the return data to include the new fields
    return {
      id,
      title,
      location,
      capacity,
      amenities,
      description,
      photos: photos.length > 0 ? photos : [], 
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
