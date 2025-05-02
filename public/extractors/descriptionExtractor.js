
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
    '.accommodation-description',
    '.beschrijving',              // Nederlandse benaming
    '[class*="beschrijving"]',    // Classes die "beschrijving" bevatten
    '[id*="beschrijving"]',       // ID's die "beschrijving" bevatten
    'h2:contains("Beschrijving") + p, h2:contains("Description") + p'  // Paragraaf na kopje beschrijving
  ];
  
  for (const selector of descriptionSelectors) {
    const descEl = document.querySelector(selector);
    if (descEl) {
      description = descEl.innerText.trim();
      break;
    }
  }
  
  // Als nog geen beschrijving gevonden, probeer te zoeken in de paragrafen onder een beschrijvingskop
  if (!description) {
    document.querySelectorAll('h2, h3').forEach(heading => {
      if (heading.innerText.toLowerCase().includes('beschrijving') || 
          heading.innerText.toLowerCase().includes('description')) {
        let nextEl = heading.nextElementSibling;
        while (nextEl && (nextEl.tagName === 'P' || nextEl.tagName === 'DIV')) {
          description += nextEl.innerText.trim() + ' ';
          nextEl = nextEl.nextElementSibling;
        }
      }
    });
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
