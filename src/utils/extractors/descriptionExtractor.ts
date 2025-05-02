
/**
 * Extracts accommodation description from the document
 */
export const extractDescription = (doc: Document): string => {
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
  
  return description;
};
