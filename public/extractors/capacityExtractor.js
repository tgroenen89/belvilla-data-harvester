
/**
 * Extracts capacity information from the page
 */
function extractCapacity() {
  let persons = 0, bedrooms = 0, bathrooms = 0;
  let area = 0, accommodationType = "";
  
  // Look for highlighted features section
  const highlightedFeatures = document.querySelector('.uitgelicht, .highlighted-features, .summary-features');
  if (highlightedFeatures) {
    const featureText = highlightedFeatures.innerText.toLowerCase();
    
    // Try to find specific patterns for each feature
    const personsMatch = featureText.match(/(\d+)\s*(gasten|personen|personnes|guests)/i);
    if (personsMatch) persons = parseInt(personsMatch[1]) || 0;
    
    const bedroomsMatch = featureText.match(/(\d+)\s*(slaapkamer|chambre|bedroom)/i);
    if (bedroomsMatch) bedrooms = parseInt(bedroomsMatch[1]) || 0;
    
    const bathroomsMatch = featureText.match(/(\d+)\s*(badkamer|salle de bain|bathroom)/i);
    if (bathroomsMatch) bathrooms = parseInt(bathroomsMatch[1]) || 0;
    
    const areaMatch = featureText.match(/(\d+[.,]?\d*)\s*m[²2]/i);
    if (areaMatch) area = parseFloat(areaMatch[1].replace(',', '.')) || 0;
    
    const typeMatch = featureText.match(/(tent lodge|lodge|cabin|chalet|apartment|appartement|villa|cottage)/i);
    if (typeMatch) accommodationType = typeMatch[1];
  }
  
  // If not found in highlighted features, try older methods
  // First try to find capacity info using multiple selectors
  if (persons === 0 || bedrooms === 0 || bathrooms === 0) {
    const capacitySelectors = [
      '.accommodation-feature', 
      '.feature-item', 
      '.property-feature',
      '[data-testid="persons-count"]',
      '[data-testid="bedrooms-count"]',
      '[data-testid="bathrooms-count"]',
      '.feature-list__item'
    ];
    
    // Try all selectors
    for (const selector of capacitySelectors) {
      document.querySelectorAll(selector).forEach(element => {
        const text = element.innerText.toLowerCase();
        if (text.includes('personen') || text.includes('gasten') || text.includes('persons') || text.includes('guests')) {
          const match = text.match(/\d+/);
          if (match) persons = parseInt(match[0]) || 0;
        } else if (text.includes('slaapkamer') || text.includes('bedroom') || text.includes('chambre')) {
          const match = text.match(/\d+/);
          if (match) bedrooms = parseInt(match[0]) || 0;
        } else if (text.includes('badkamer') || text.includes('bathroom') || text.includes('salle de bain')) {
          const match = text.match(/\d+/);
          if (match) bathrooms = parseInt(match[0]) || 0;
        } else if (text.includes('m²') || text.includes('m2') || text.includes('area') || text.includes('oppervlakte') || text.includes('superficie')) {
          const match = text.match(/\d+[.,]?\d*/);
          if (match) area = parseFloat(match[0].replace(',', '.')) || 0;
        } else if (text.includes('type') || text.includes('accommodation') || text.includes('accommodatie') || text.includes('hébergement')) {
          const typeMatch = text.match(/(tent lodge|lodge|cabin|chalet|apartment|appartement|villa|cottage)/i);
          if (typeMatch) accommodationType = typeMatch[1];
        }
      });
    }
  }
  
  // Try to scan all elements with certain classes that might contain capacity info
  const possibleCapacityContainers = [
    '.features',
    '.accommodation-features',
    '.property-details',
    '.details-container'
  ];
  
  if (persons === 0 || bedrooms === 0 || bathrooms === 0 || area === 0 || !accommodationType) {
    for (const selector of possibleCapacityContainers) {
      const container = document.querySelector(selector);
      if (container) {
        const text = container.innerText.toLowerCase();
        
        if (persons === 0) {
          const personsMatch = text.match(/(\d+)\s*(personen|gasten|persons|guests|personnes)/i);
          if (personsMatch) persons = parseInt(personsMatch[1]) || 0;
        }
        
        if (bedrooms === 0) {
          const bedroomsMatch = text.match(/(\d+)\s*(slaapkamer|bedroom|chambre)/i);
          if (bedroomsMatch) bedrooms = parseInt(bedroomsMatch[1]) || 0;
        }
        
        if (bathrooms === 0) {
          const bathroomsMatch = text.match(/(\d+)\s*(badkamer|bathroom|salle de bain)/i);
          if (bathroomsMatch) bathrooms = parseInt(bathroomsMatch[1]) || 0;
        }
        
        if (area === 0) {
          const areaMatch = text.match(/(\d+[.,]?\d*)\s*m[²2]/i);
          if (areaMatch) area = parseFloat(areaMatch[1].replace(',', '.')) || 0;
        }
        
        if (!accommodationType) {
          const typeMatch = text.match(/(tent lodge|lodge|cabin|chalet|apartment|appartement|villa|cottage)/i);
          if (typeMatch) accommodationType = typeMatch[1];
        }
      }
    }
  }
  
  // If persons still 0, check meta description
  if (persons === 0) {
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const personsMatch = metaDescription.match(/(\d+)\s+personen/i);
    if (personsMatch && personsMatch[1]) {
      persons = parseInt(personsMatch[1]);
    }
  }
  
  // Check JSON-LD data for capacity information
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  scripts.forEach(script => {
    try {
      const jsonData = JSON.parse(script.textContent || '{}');
      
      // Look for Schema.org data
      if (jsonData.numberOfGuests) {
        persons = persons || parseInt(jsonData.numberOfGuests);
      }
      if (jsonData.numberOfRooms) {
        bedrooms = bedrooms || parseInt(jsonData.numberOfRooms);
      }
      if (jsonData.numberOfBathrooms) {
        bathrooms = bathrooms || parseInt(jsonData.numberOfBathrooms);
      }
      if (jsonData.floorSize && jsonData.floorSize.value) {
        area = area || parseFloat(jsonData.floorSize.value);
      }
      if (jsonData.accommodationType) {
        accommodationType = accommodationType || jsonData.accommodationType;
      }
      
      // Also check nested accommodationCategory
      if (jsonData.accommodationCategory) {
        if (jsonData.accommodationCategory.maxOccupancy) {
          persons = persons || parseInt(jsonData.accommodationCategory.maxOccupancy);
        }
        if (jsonData.accommodationCategory.name) {
          accommodationType = accommodationType || jsonData.accommodationCategory.name;
        }
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  });
  
  return { persons, bedrooms, bathrooms, area, type: accommodationType };
}
