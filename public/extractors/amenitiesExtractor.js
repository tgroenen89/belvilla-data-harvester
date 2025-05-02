
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
    '.amenities li'
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
      '.facilities ul li'
    ];
    
    for (const selector of possibleAmenitySelectors) {
      document.querySelectorAll(selector).forEach(item => {
        const text = item.innerText.trim();
        if (text && !amenities.includes(text)) amenities.push(text);
      });
      if (amenities.length > 0) break;
    }
  }
  
  return amenities;
}
