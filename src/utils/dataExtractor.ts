
import { BelvillaData } from "@/types/belvilla";
import { getMockPhotos } from "./mockData";
import { extractLocation } from "./extractors/locationExtractor";
import { extractCapacity } from "./extractors/capacityExtractor";
import { extractAmenities } from "./extractors/amenitiesExtractor";
import { extractDescription } from "./extractors/descriptionExtractor";
import { extractPhotos } from "./extractors/photosExtractor";
import { extractPrice } from "./extractors/priceExtractor";
import { extractRating } from "./extractors/ratingExtractor";
import { extractRules } from "./extractors/rulesExtractor";

/**
 * Extracts Belvilla data from HTML document
 */
export const extractDataFromHTML = (doc: Document, url: string): BelvillaData | null => {
  try {
    // Extract ID from URL
    const idMatch = url.match(/\/([0-9]+)\/?$/);
    const id = idMatch ? idMatch[1] : "";
    
    // Extract title
    const title = doc.querySelector('h1')?.textContent || "";
    
    // Extract location info
    const location = extractLocation(doc);
    
    // Extract capacity information
    const capacity = extractCapacity(doc);
    
    // Extract amenities
    const amenities = extractAmenities(doc);
    
    // Extract description
    const description = extractDescription(doc);
    
    // Extract photos
    const photos = extractPhotos(doc);
    
    // Extract price information
    const price = extractPrice(doc);
    
    // Extract rating
    const rating = extractRating(doc);
    
    // Extract rules
    const rules = extractRules(doc);
    
    console.log("Extracted data:", {
      id,
      title,
      location,
      capacity,
      amenities: amenities.length,
      description: description ? description.substring(0, 50) + "..." : "Not found",
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
      photos: photos.length > 0 ? photos : [], 
      price,
      rating,
      rules
    };
  } catch (error) {
    console.error("Error extracting data from HTML:", error);
    return null;
  }
};
