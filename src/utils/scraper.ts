
import { BelvillaData } from "@/types/belvilla";

/**
 * Extracts data from a Belvilla URL using the Chrome extension API
 * or falls back to mock data if running outside of the extension context.
 */
export const scrapeBelvillaData = async (url: string): Promise<BelvillaData | null> => {
  try {
    // Check if this is a valid Belvilla URL
    if (!url.includes("belvilla.nl")) {
      return null;
    }
    
    // Check if we're running in a Chrome extension context
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.scripting) {
      // Extract the URL's domain and path
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      
      // Find or create a tab for the URL
      let targetTab;
      
      try {
        // Try to find an existing tab with the URL
        const tabs = await chrome.tabs.query({ url: url });
        
        if (tabs.length > 0) {
          targetTab = tabs[0];
        } else {
          // Create a new tab if none exists
          targetTab = await chrome.tabs.create({ url, active: false });
          
          // Wait a bit for the page to load
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        // Now, execute our content script on the tab
        const results = await chrome.tabs.sendMessage(targetTab.id!, { action: "extractData" });
        
        // Close the tab if we created it
        if (tabs.length === 0) {
          await chrome.tabs.remove(targetTab.id!);
        }
        
        return results;
      } catch (error) {
        console.error("Error with Chrome extension API:", error);
        // Fall back to mock data
        return getMockData(url);
      }
    } else {
      console.warn("Chrome extension API not available, using mock data");
      // Fall back to mock data when not running in a Chrome extension
      return getMockData(url);
    }
  } catch (error) {
    console.error("Error scraping data:", error);
    return null;
  }
};

// Mock data function - used when not in Chrome extension context
const getMockData = (url: string): BelvillaData => {
  // Extract ID from URL
  const idMatch = url.match(/\/([0-9]+)\/?$/);
  const id = idMatch ? idMatch[1] : "unknown";
  
  return {
    id: id,
    title: "Luxe villa met privé zwembad en panoramisch uitzicht",
    location: {
      country: "Frankrijk",
      region: "Provence-Alpes-Côte d'Azur",
      city: "Saint-Tropez"
    },
    capacity: {
      persons: 8,
      bedrooms: 4,
      bathrooms: 3
    },
    amenities: [
      "Zwembad", 
      "Tuin", 
      "Terras", 
      "BBQ", 
      "WiFi", 
      "Airco", 
      "Vaatwasser", 
      "Wasmachine", 
      "TV", 
      "Parkeerplaats",
      "Kinderstoel",
      "Babybed",
      "Fietsberging",
      "Buitendouche"
    ],
    description: "Deze luxe villa ligt op een heuvel en biedt een adembenemend uitzicht op de Middellandse Zee. De woning beschikt over een privé zwembad, een ruime tuin en meerdere terrassen waar u heerlijk kunt genieten van de zon.\n\nDe villa is volledig ingericht met alle moderne gemakken en biedt plaats aan 8 personen. In de omgeving vindt u prachtige stranden, gezellige dorpjes en uitstekende restaurants.",
    photos: [
      "https://picsum.photos/id/10/800/600",
      "https://picsum.photos/id/11/800/600",
      "https://picsum.photos/id/12/800/600",
      "https://picsum.photos/id/13/800/600",
      "https://picsum.photos/id/14/800/600",
      "https://picsum.photos/id/15/800/600"
    ],
    price: {
      basePrice: 2150,
      description: "Week (7 nachten) in het hoogseizoen",
      additionalCosts: [
        { description: "Schoonmaakkosten", amount: "€ 150" },
        { description: "Toeristenbelasting", amount: "€ 2,53 p.p.p.n" },
        { description: "Borg", amount: "€ 500" }
      ],
      info: "Prijzen variëren per seizoen. Kortingen mogelijk bij langere verblijven."
    },
    rating: {
      score: 8.7,
      count: 24
    },
    rules: [
      "Inchecken vanaf 16:00 uur",
      "Uitchecken voor 10:00 uur",
      "Huisdieren niet toegestaan",
      "Roken niet toegestaan in het huis",
      "Geen feesten of evenementen"
    ]
  };
};
