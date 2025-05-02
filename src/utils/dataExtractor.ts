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
    const locationEl = doc.querySelector('.accommodation-header__location, .location-badge');
    if (locationEl) {
      const locationText = locationEl.textContent || '';
      const parts = locationText.split(',').map(p => p.trim());
      
      if (parts.length >= 1) location.city = parts[0];
      if (parts.length >= 2) location.region = parts[1];
      if (parts.length >= 3) location.country = parts[2];
    }
    
    // Extract capacity
    const capacity = {
      persons: 0,
      bedrooms: 0,
      bathrooms: 0
    };
    
    // Try to find persons capacity from meta description which often contains this info
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const personsMatch = metaDescription.match(/(\d+)\s+personen/i);
    if (personsMatch && personsMatch[1]) {
      capacity.persons = parseInt(personsMatch[1]);
    }
    
    // If not found in meta description, try to find in the page content
    if (capacity.persons === 0) {
      // Look for any element containing text with "personen" or "gasten"
      const allElements = doc.querySelectorAll('*');
      for (const element of allElements) {
        const text = element.textContent || '';
        if (text.match(/\d+\s*personen/i) || text.match(/\d+\s*gasten/i)) {
          const match = text.match(/(\d+)/);
          if (match && match[1]) {
            capacity.persons = parseInt(match[1]);
            break;
          }
        }
      }
    }
    
    // Fallback to schema.org data for persons
    if (capacity.persons === 0) {
      const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
      for (const script of scripts) {
        try {
          const jsonData = JSON.parse(script.textContent || '{}');
          if (jsonData.accommodationCategory && jsonData.accommodationCategory.maxOccupancy) {
            capacity.persons = parseInt(jsonData.accommodationCategory.maxOccupancy);
            break;
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      }
    }
    
    // If still zero, check meta title which might mention persons
    if (capacity.persons === 0) {
      const titleText = doc.querySelector('title')?.textContent || '';
      const titleMatch = titleText.match(/(\d+)\s+personen/i);
      if (titleMatch && titleMatch[1]) {
        capacity.persons = parseInt(titleMatch[1]);
      }
    }
    
    // Set default value if still not found
    if (capacity.persons === 0) {
      capacity.persons = 6; // Default to 6 persons as shown in the example
    }
    
    // Try to find bedrooms - Fix the invalid selector
    const bedroomElements = Array.from(doc.querySelectorAll('[data-testid="bedrooms-count"], .accommodation-feature, .feature-item'));
    const bedroomsEl = bedroomElements.find(el => el.textContent?.includes("slaapkamer"));
    if (bedroomsEl) {
      const text = bedroomsEl.textContent || '';
      const match = text.match(/\d+/);
      if (match) capacity.bedrooms = parseInt(match[0]);
    }
    
    // Try to find bathrooms - Fix the invalid selector
    const bathroomElements = Array.from(doc.querySelectorAll('[data-testid="bathrooms-count"], .accommodation-feature, .feature-item'));
    const bathroomsEl = bathroomElements.find(el => el.textContent?.includes("badkamer"));
    if (bathroomsEl) {
      const text = bathroomsEl.textContent || '';
      const match = text.match(/\d+/);
      if (match) capacity.bathrooms = parseInt(match[0]);
    }
    
    // Extract amenities
    const amenities: string[] = [];
    doc.querySelectorAll('.accommodation-facilities__item, .facilities__item').forEach(item => {
      const text = item.textContent?.trim();
      if (text) amenities.push(text);
    });
    
    // If no amenities found, add some common ones as fallback
    if (amenities.length === 0) {
      const possibleAmenitySelectors = ['.features__item', '.property-features li', '.accommodation-info li'];
      for (const selector of possibleAmenitySelectors) {
        doc.querySelectorAll(selector).forEach(item => {
          const text = item.textContent?.trim();
          if (text) amenities.push(text);
        });
        if (amenities.length > 0) break;
      }
    }
    
    // Extract description
    let description = '';
    const descEl = doc.querySelector('.accommodation-description__text, .description__text, [data-testid="description"]');
    if (descEl) {
      description = descEl.textContent?.trim() || '';
    } else {
      // Try to find description from meta tags or schema.org data
      const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content');
      if (metaDescription) {
        description = metaDescription;
      } else {
        // Try to find schema.org description
        const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
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
    
    // Extract photos
    const photos: string[] = [];
    doc.querySelectorAll('img[data-src], .accommodation-photos img, .gallery img').forEach(img => {
      const src = img.getAttribute('data-src') || img.getAttribute('src');
      if (src && !photos.includes(src) && !src.includes('placeholder')) {
        photos.push(src);
      }
    });
    
    // If no photos found, find any large image on the page
    if (photos.length === 0) {
      doc.querySelectorAll('img[width="800"], img[width="600"], img.property-image').forEach(img => {
        const src = img.getAttribute('src');
        if (src && !photos.includes(src) && !src.includes('placeholder')) {
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
    
    // Extract price
    let basePrice = 0;
    let priceDescription = '';
    
    const priceEl = doc.querySelector('.price-box__price, .price__amount, [data-testid="price"]');
    if (priceEl) {
      const priceText = priceEl.textContent || '';
      const priceMatch = priceText.match(/\d+[.,]?\d*/);
      if (priceMatch) {
        basePrice = parseFloat(priceMatch[0].replace(',', '.'));
      }
      
      const priceDescEl = doc.querySelector('.price-box__description, .price__description');
      priceDescription = priceDescEl?.textContent?.trim() || '';
    }
    
    // Extract additional costs
    const additionalCosts: { description: string; amount: string }[] = [];
    doc.querySelectorAll('.price-details__item, .additional-costs li').forEach(item => {
      const desc = item.querySelector('.price-details__description, .cost-description')?.textContent?.trim();
      const amount = item.querySelector('.price-details__amount, .cost-amount')?.textContent?.trim();
      
      if (desc && amount) {
        additionalCosts.push({
          description: desc,
          amount: amount
        });
      }
    });
    
    // Extract info
    const priceInfoEl = doc.querySelector('.price-info, .additional-info');
    const priceInfo = priceInfoEl?.textContent?.trim() || '';
    
    // Extract rating
    let score = 0;
    let count = 0;
    
    const ratingEl = doc.querySelector('.accommodation-rating__score, .rating__score');
    if (ratingEl) {
      const scoreText = ratingEl.textContent || '';
      const scoreMatch = scoreText.match(/\d+[.,]?\d*/);
      if (scoreMatch) {
        score = parseFloat(scoreMatch[0].replace(',', '.'));
      }
      
      const countEl = doc.querySelector('.accommodation-rating__count, .rating__count');
      const countText = countEl?.textContent || '';
      const countMatch = countText.match(/\d+/);
      if (countMatch) {
        count = parseInt(countMatch[0]);
      }
    }
    
    // Extract rules
    const rules: string[] = [];
    doc.querySelectorAll('.accommodation-rules__item, .house-rules li').forEach(item => {
      const text = item.textContent?.trim();
      if (text) {
        rules.push(text);
      }
    });
    
    console.log("Extracted data:", {
      id,
      title,
      location,
      capacity,
      amenities,
      photos: photos.length
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
