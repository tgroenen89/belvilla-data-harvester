
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
    
    // Try to find persons capacity
    const personsEl = doc.querySelector('[data-testid="guests-count"], .accommodation-feature:contains("personen")');
    if (personsEl) {
      const text = personsEl.textContent || '';
      const match = text.match(/\d+/);
      if (match) capacity.persons = parseInt(match[0]);
    }
    
    // Try to find bedrooms
    const bedroomsEl = doc.querySelector('[data-testid="bedrooms-count"], .accommodation-feature:contains("slaapkamer")');
    if (bedroomsEl) {
      const text = bedroomsEl.textContent || '';
      const match = text.match(/\d+/);
      if (match) capacity.bedrooms = parseInt(match[0]);
    }
    
    // Try to find bathrooms
    const bathroomsEl = doc.querySelector('[data-testid="bathrooms-count"], .accommodation-feature:contains("badkamer")');
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
