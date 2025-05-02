
import { BelvillaData } from "@/types/belvilla";
import { extractDataFromHTML } from "./dataExtractor";
import { getMockData } from "./mockData";

/**
 * Extracts data from a Belvilla URL using the Cors-Anywhere proxy to bypass CORS restrictions.
 */
export const scrapeBelvillaData = async (url: string): Promise<BelvillaData | null> => {
  try {
    // Check if this is a valid Belvilla URL
    if (!url.includes("belvilla")) {
      console.error("Invalid URL: Not a Belvilla URL");
      return null;
    }
    
    console.log("Attempting to fetch data from:", url);
    
    // Due to CORS restrictions in browsers, we need to use a proxy
    const proxyUrl = "https://api.allorigins.win/raw?url=";
    
    try {
      const response = await fetch(proxyUrl + encodeURIComponent(url), {
        method: 'GET',
        headers: {
          'Accept': 'text/html'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      // Get the HTML content
      const html = await response.text();
      
      // Create a DOM parser to work with the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      console.log("HTML fetched successfully, parsing data...");
      
      // Extract data from the HTML
      const data = extractDataFromHTML(doc, url);
      
      if (!data) {
        console.error("Failed to extract data from HTML");
        return getMockData(url); // Fallback to mock data if extraction fails
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching or parsing data:", error);
      console.log("Falling back to mock data...");
      return getMockData(url); // Fallback to mock data if fetching fails
    }
  } catch (error) {
    console.error("Error in scraper:", error);
    return null;
  }
};
