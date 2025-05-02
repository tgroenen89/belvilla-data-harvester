
/**
 * Extracts capacity information from the document
 */
export const extractCapacity = (doc: Document) => {
  const capacity = {
    persons: 0,
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    type: ""
  };
  
  // Look for highlighted features section
  const highlightedFeatures = doc.querySelector('.uitgelicht, .highlighted-features, .summary-features');
  if (highlightedFeatures) {
    const featureText = highlightedFeatures.textContent?.toLowerCase() || '';
    
    // Try to find specific patterns for each feature
    const personsMatch = featureText.match(/(\d+)\s*(gasten|personen|personnes|guests)/i);
    if (personsMatch) capacity.persons = parseInt(personsMatch[1]) || 0;
    
    const bedroomsMatch = featureText.match(/(\d+)\s*(slaapkamer|chambre|bedroom)/i);
    if (bedroomsMatch) capacity.bedrooms = parseInt(bedroomsMatch[1]) || 0;
    
    const bathroomsMatch = featureText.match(/(\d+)\s*(badkamer|salle de bain|bathroom)/i);
    if (bathroomsMatch) capacity.bathrooms = parseInt(bathroomsMatch[1]) || 0;
    
    const areaMatch = featureText.match(/(\d+[.,]?\d*)\s*m[²2]/i);
    if (areaMatch) capacity.area = parseFloat(areaMatch[1].replace(',', '.')) || 0;
    
    const typeMatch = featureText.match(/(tent lodge|lodge|cabin|chalet|apartment|appartement|villa|cottage)/i);
    if (typeMatch) capacity.type = typeMatch[1];
  }
  
  // If not found in highlighted features, try other selectors
  if (capacity.persons === 0 || capacity.bedrooms === 0 || capacity.bathrooms === 0) {
    // Try to find capacity info using multiple selectors
    const capacitySelectors = [
      '.accommodation-feature', 
      '.feature-item', 
      '.property-feature',
      '[data-testid="persons-count"]',
      '[data-testid="bedrooms-count"]',
      '[data-testid="bathrooms-count"]',
      '.feature-list__item',
      '.features li'
    ];
    
    // Try all selectors for each capacity item
    for (const selector of capacitySelectors) {
      doc.querySelectorAll(selector).forEach(element => {
        const text = element.textContent?.toLowerCase() || '';
        if (text.includes('personen') || text.includes('gasten') || text.includes('persons')) {
          const match = text.match(/\d+/);
          if (match) capacity.persons = parseInt(match[0]) || 0;
        } else if (text.includes('slaapkamer') || text.includes('bedroom')) {
          const match = text.match(/\d+/);
          if (match) capacity.bedrooms = parseInt(match[0]) || 0;
        } else if (text.includes('badkamer') || text.includes('bathroom')) {
          const match = text.match(/\d+/);
          if (match) capacity.bathrooms = parseInt(match[0]) || 0;
        }
      });
    }
  }
  
  // Try to scan specific containers for capacity info
  const possibleCapacityContainers = [
    '.features',
    '.accommodation-features',
    '.property-details',
    '.details-container'
  ];
  
  if (capacity.persons === 0 || capacity.bedrooms === 0 || capacity.bathrooms === 0) {
    for (const selector of possibleCapacityContainers) {
      const container = doc.querySelector(selector);
      if (container) {
        const text = container.textContent?.toLowerCase() || '';
        
        if (capacity.persons === 0) {
          const personsMatch = text.match(/(\d+)\s*(personen|gasten|persons)/i);
          if (personsMatch) capacity.persons = parseInt(personsMatch[1]) || 0;
        }
        
        if (capacity.bedrooms === 0) {
          const bedroomsMatch = text.match(/(\d+)\s*(slaapkamer|bedroom)/i);
          if (bedroomsMatch) capacity.bedrooms = parseInt(bedroomsMatch[1]) || 0;
        }
        
        if (capacity.bathrooms === 0) {
          const bathroomsMatch = text.match(/(\d+)\s*(badkamer|bathroom)/i);
          if (bathroomsMatch) capacity.bathrooms = parseInt(bathroomsMatch[1]) || 0;
        }
      }
    }
  }
  
  // Add extraction for area and type
  const areaSelectors = [
    '[data-testid="area"]',
    '.area',
    '[class*="area"]',
    '.property-size'
  ];
  
  for (const selector of areaSelectors) {
    const areaEl = doc.querySelector(selector);
    if (areaEl) {
      const text = areaEl.textContent?.toLowerCase() || '';
      const match = text.match(/(\d+[.,]?\d*)\s*m[²2]/);
      if (match) {
        capacity.area = parseFloat(match[1].replace(',', '.')) || 0;
        break;
      }
    }
  }
  
  const typeSelectors = [
    '[data-testid="accommodation-type"]',
    '.accommodation-type',
    '.property-type'
  ];
  
  for (const selector of typeSelectors) {
    const typeEl = doc.querySelector(selector);
    if (typeEl) {
      capacity.type = typeEl.textContent?.trim() || '';
      break;
    }
  }
  
  // If persons still 0, check meta description
  if (capacity.persons === 0) {
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const personsMatch = metaDescription.match(/(\d+)\s+personen/i);
    if (personsMatch && personsMatch[1]) {
      capacity.persons = parseInt(personsMatch[1]);
    }
  }
  
  // Try schema.org data for capacity and other info
  const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
  for (const script of scripts) {
    try {
      const jsonData = JSON.parse(script.textContent || '{}');
      
      // Look for capacity in schema.org data
      if (jsonData.numberOfGuests) {
        capacity.persons = capacity.persons || parseInt(jsonData.numberOfGuests);
      }
      if (jsonData.numberOfRooms) {
        capacity.bedrooms = capacity.bedrooms || parseInt(jsonData.numberOfRooms);
      }
      if (jsonData.numberOfBathrooms) {
        capacity.bathrooms = capacity.bathrooms || parseInt(jsonData.numberOfBathrooms);
      }
      if (jsonData.floorSize && jsonData.floorSize.value) {
        capacity.area = capacity.area || parseFloat(jsonData.floorSize.value);
      }
      if (jsonData.accommodationType) {
        capacity.type = capacity.type || jsonData.accommodationType;
      }
      
      // Also check nested accommodationCategory
      if (jsonData.accommodationCategory) {
        if (jsonData.accommodationCategory.maxOccupancy) {
          capacity.persons = capacity.persons || parseInt(jsonData.accommodationCategory.maxOccupancy);
        }
        if (jsonData.accommodationCategory.name) {
          capacity.type = capacity.type || jsonData.accommodationCategory.name;
        }
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }
  
  return capacity;
};
