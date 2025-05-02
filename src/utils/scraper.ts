
import { BelvillaData } from "@/types/belvilla";
import { extractDataFromHTML } from "./dataExtractor";
import { getMockData } from "./mockData";

/**
 * Extracts data from a Belvilla URL using a proxy to bypass CORS restrictions.
 */
export const scrapeBelvillaData = async (url: string): Promise<BelvillaData | null> => {
  try {
    // Check if this is a valid Belvilla URL
    if (!url.includes("belvilla")) {
      console.error("Invalid URL: Not a Belvilla URL");
      return null;
    }
    
    console.log("Attempting to fetch data from:", url);
    
    // Try multiple proxies in case one fails
    const proxyUrls = [
      "https://api.allorigins.win/raw?url=",
      "https://corsproxy.io/?",
      "https://cors-anywhere.herokuapp.com/",
      "https://cors.eu.org/"
    ];
    
    let html: string | null = null;
    let lastError: Error | null = null;
    
    // Try each proxy until one works
    for (const proxyUrl of proxyUrls) {
      try {
        const encodedUrl = encodeURIComponent(url);
        const response = await fetch(proxyUrl + encodedUrl, {
          method: 'GET',
          headers: {
            'Accept': 'text/html'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        html = await response.text();
        console.log(`Successfully fetched HTML using proxy: ${proxyUrl}`);
        break; // Exit the loop if successful
      } catch (e) {
        lastError = e as Error;
        console.log(`Proxy ${proxyUrl} failed, trying next one...`);
      }
    }
    
    if (!html) {
      throw new Error(`All proxies failed: ${lastError?.message}`);
    }
    
    // Check if we got a real HTML page (not an error page)
    if (html.length < 1000 || !html.includes('<html')) {
      console.error("Retrieved content is not valid HTML:", html.substring(0, 100));
      throw new Error("Retrieved content is not valid HTML");
    }
    
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
    
    // Don't set default values anymore - return the data as is
    return data;
  } catch (error) {
    console.error("Error in scraper:", error);
    console.log("Falling back to mock data...");
    return getMockData(url); // Fallback to mock data if fetching fails
  }
};
