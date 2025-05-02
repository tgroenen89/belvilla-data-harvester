
// This script runs directly on Belvilla pages
console.log("Belvilla Data Harvester content script loaded");

// Function to extract data from the current page
function extractBelvillaData() {
  try {
    // Extract the accommodation ID from URL
    const url = window.location.href;
    const idMatch = url.match(/\/([0-9]+)\/?$/);
    const id = idMatch ? idMatch[1] : "unknown";
    
    // Extract title
    const title = document.querySelector('h1')?.innerText || "Unknown Title";
    
    // Extract location data
    const locationInfo = document.querySelector('.accommodation-header__location')?.innerText || '';
    const locationParts = locationInfo.split(',').map(part => part.trim());
    const location = {
      city: locationParts[0] || "Unknown City",
      region: locationParts[1] || "Unknown Region",
      country: locationParts[2] || "Unknown Country"
    };
    
    // Extract capacity information - Improved person detection
    let persons = 0, bedrooms = 0, bathrooms = 0;
    
    // First try to find directly in capacity info
    const capacityInfo = document.querySelectorAll('.accommodation-feature');
    capacityInfo.forEach(element => {
      const text = element.innerText.toLowerCase();
      if (text.includes('personen') || text.includes('gasten')) {
        const match = text.match(/\d+/);
        if (match) persons = parseInt(match[0]) || 0;
      } else if (text.includes('slaapkamer')) {
        const match = text.match(/\d+/);
        if (match) bedrooms = parseInt(match[0]) || 0;
      } else if (text.includes('badkamer')) {
        const match = text.match(/\d+/);
        if (match) bathrooms = parseInt(match[0]) || 0;
      }
    });
    
    // If persons still 0, check meta description
    if (persons === 0) {
      const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const personsMatch = metaDescription.match(/(\d+)\s+personen/i);
      if (personsMatch && personsMatch[1]) {
        persons = parseInt(personsMatch[1]);
      }
    }
    
    // If still 0, scan all elements
    if (persons === 0) {
      const allElements = document.querySelectorAll('*');
      for (const element of allElements) {
        const text = element.innerText?.toLowerCase() || '';
        if (text.match(/\d+\s*personen/) || text.match(/\d+\s*gasten/)) {
          const match = text.match(/(\d+)/);
          if (match) {
            persons = parseInt(match[0]);
            break;
          }
        }
      }
    }
    
    // Default to 6 if still not found
    if (persons === 0) {
      persons = 6;
    }
    
    // Extract amenities
    const amenities = [];
    document.querySelectorAll('.accommodation-facilities__item').forEach(item => {
      const text = item.innerText.trim();
      if (text) amenities.push(text);
    });
    
    // Extract description
    const description = document.querySelector('.accommodation-description__text')?.innerText || "No description available";
    
    // Extract photos
    const photos = [];
    document.querySelectorAll('.accommodation-photos img').forEach(img => {
      const src = img.src;
      if (src && !photos.includes(src)) photos.push(src);
    });
    
    // Extract price information
    let basePrice = 0;
    const priceElement = document.querySelector('.price-box__price');
    if (priceElement) {
      const priceText = priceElement.innerText.replace(/[^0-9,]/g, '').replace(',', '.');
      basePrice = parseFloat(priceText) || 0;
    }
    
    const priceDescription = document.querySelector('.price-box__description')?.innerText || "";
    
    // Extract additional costs
    const additionalCosts = [];
    document.querySelectorAll('.price-details__item').forEach(item => {
      const description = item.querySelector('.price-details__description')?.innerText || "";
      const amount = item.querySelector('.price-details__amount')?.innerText || "";
      if (description && amount) {
        additionalCosts.push({ description, amount });
      }
    });
    
    const priceInfo = document.querySelector('.price-info')?.innerText || "";
    
    // Extract rating
    let score = 0, count = 0;
    const ratingElement = document.querySelector('.accommodation-rating__score');
    if (ratingElement) {
      score = parseFloat(ratingElement.innerText) || 0;
      const countText = document.querySelector('.accommodation-rating__count')?.innerText || "";
      const countMatch = countText.match(/\d+/);
      count = countMatch ? parseInt(countMatch[0]) : 0;
    }
    
    // Extract rules
    const rules = [];
    document.querySelectorAll('.accommodation-rules__item').forEach(item => {
      const text = item.innerText.trim();
      if (text) rules.push(text);
    });
    
    return {
      id,
      title,
      location,
      capacity: { persons, bedrooms, bathrooms },
      amenities,
      description,
      photos,
      price: {
        basePrice,
        description: priceDescription,
        additionalCosts,
        info: priceInfo
      },
      rating: { score, count },
      rules
    };
  } catch (error) {
    console.error("Error extracting data:", error);
    return null;
  }
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extractData") {
    console.log("Extracting data from Belvilla page");
    const data = extractBelvillaData();
    sendResponse(data);
  }
});
