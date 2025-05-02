
/**
 * Extracts amenity information from the page
 */
function extractAmenities() {
  const amenities = [];
  const amenitySelectors = [
    '.accommodation-facilities__item', 
    '.facilities__item',
    '.amenities__item',
    '.feature-list__item',
    '.features li',
    '.amenities li',
    '.voorzieningen li',       // Nederlandse pagina's
    '[class*="voorziening"] li', // Classes die "voorziening" bevatten
    '[id*="voorziening"] li',    // ID's die "voorziening" bevatten
    '[id*="amenity"] li',        // ID's die "amenity" bevatten
    '[class*="amenity"] li'      // Classes die "amenity" bevatten
  ];
  
  for (const selector of amenitySelectors) {
    document.querySelectorAll(selector).forEach(item => {
      const text = item.innerText.trim();
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
      '.facilities ul li',
      // Specifiek voor Mongoolse yurt pagina
      '.voorzieningen div',          // Direct in div elementen in voorzieningen sectie
      '[id*="voorzieningen"] div',   // div elementen in voorzieningen secties
      '.amenities div'               // div elementen in amenities secties
    ];
    
    for (const selector of possibleAmenitySelectors) {
      document.querySelectorAll(selector).forEach(item => {
        const text = item.innerText.trim();
        if (text && !amenities.includes(text)) amenities.push(text);
      });
      if (amenities.length > 0) break;
    }
  }
  
  // Als nog steeds geen voorzieningen, dan zoeken we naar iconen met labels
  if (amenities.length === 0) {
    // Zoek naar elementen met iconen (zoals in de afbeelding)
    document.querySelectorAll('div.flex, div[class*="icon"], div[class*="feature"]').forEach(container => {
      // Als het element een icoon en tekst bevat
      if (container.querySelector('svg, img') && container.innerText) {
        const text = container.innerText.trim();
        if (text && !amenities.includes(text) && text.length < 50) {
          amenities.push(text);
        }
      }
    });
  }
  
  return amenities;
}
