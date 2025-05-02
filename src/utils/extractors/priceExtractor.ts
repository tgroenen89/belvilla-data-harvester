
/**
 * Extracts price information from the document
 */
export const extractPrice = (doc: Document) => {
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
    const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
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
  
  return {
    basePrice,
    description: priceDescription,
    additionalCosts,
    info: priceInfo
  };
};
