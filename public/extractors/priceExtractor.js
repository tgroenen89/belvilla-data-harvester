
/**
 * Extracts price information from the page
 */
function extractPrice() {
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
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
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
  
  // Extract additional costs
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
  
  return {
    basePrice,
    description: priceDescription,
    additionalCosts,
    info: priceInfo
  };
}
