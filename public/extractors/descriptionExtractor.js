
/**
 * Extracts accommodation description from the page
 */
function extractDescription() {
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
  
  // Try to find description from schema.org data
  if (!description) {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
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
  
  return description;
}
