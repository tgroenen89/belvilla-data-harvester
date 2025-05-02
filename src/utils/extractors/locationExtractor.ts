
/**
 * Extracts location information from the document
 */
export const extractLocation = (doc: Document) => {
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
  
  return location;
};
