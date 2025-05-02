
// This script runs directly on Belvilla pages
console.log("Belvilla Data Harvester content script loaded");

// Import all the extractor functions
importScripts(
  'extractors/idExtractor.js',
  'extractors/locationExtractor.js',
  'extractors/capacityExtractor.js',
  'extractors/amenitiesExtractor.js',
  'extractors/descriptionExtractor.js',
  'extractors/photosExtractor.js',
  'extractors/priceExtractor.js',
  'extractors/ratingExtractor.js',
  'extractors/rulesExtractor.js'
);

// Function to extract data from the current page
function extractBelvillaData() {
  try {
    // Extract the accommodation ID from URL
    const url = window.location.href;
    const id = extractId(url);
    
    // Extract title
    const title = document.querySelector('h1')?.innerText || "";
    
    // Extract all data using our specialized extractors
    const location = extractLocation();
    const capacity = extractCapacity();
    const amenities = extractAmenities();
    const description = extractDescription();
    const photos = extractPhotos();
    const price = extractPrice();
    const rating = extractRating();
    const rules = extractRules();
    
    console.log("Extracted data:", {
      id, 
      title, 
      location, 
      capacity,
      amenities: amenities.length,
      description: description ? "Found" : "Not found",
      photos: photos.length,
      rating
    });
    
    // Return the complete extracted data
    return {
      id,
      title,
      location,
      capacity,
      amenities,
      description,
      photos,
      price,
      rating,
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
