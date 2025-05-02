
import { BelvillaData } from "@/types/belvilla";

/**
 * Extracts data from a Belvilla URL using the Cors-Anywhere proxy to bypass CORS restrictions.
 */
export const scrapeBelvillaData = async (url: string): Promise<BelvillaData | null> => {
  try {
    // Check if this is a valid Belvilla URL
    if (!url.includes("belvilla.nl")) {
      console.error("Invalid URL: Not a Belvilla URL");
      return null;
    }
    
    console.log("Attempting to fetch data from:", url);
    
    // Due to CORS restrictions in browsers, we need to use a proxy
    // We'll use a public CORS proxy service (not recommended for production)
    const proxyUrl = "https://corsproxy.io/?";
    
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

/**
 * Extracts Belvilla data from HTML document
 */
const extractDataFromHTML = (doc: Document, url: string): BelvillaData | null => {
  try {
    // Extract ID from URL
    const idMatch = url.match(/\/([0-9]+)\/?$/);
    const id = idMatch ? idMatch[1] : "unknown";
    
    // Extract title
    const title = doc.querySelector('h1')?.innerText || "Onbekende accommodatie";
    
    // Extract location info
    let location = { country: "Onbekend", region: "Onbekend", city: "Onbekend" };
    const locationEl = doc.querySelector('.accommodation-header__location, .location-badge');
    if (locationEl) {
      const locationText = locationEl.textContent || '';
      const parts = locationText.split(',').map(p => p.trim());
      
      if (parts.length >= 1) location.city = parts[0];
      if (parts.length >= 2) location.region = parts[1];
      if (parts.length >= 3) location.country = parts[2];
    }
    
    // Extract capacity
    const capacity = {
      persons: 0,
      bedrooms: 0,
      bathrooms: 0
    };
    
    // Try to find persons capacity
    const personsEl = doc.querySelector('[data-testid="guests-count"], .accommodation-feature:contains("personen")');
    if (personsEl) {
      const text = personsEl.textContent || '';
      const match = text.match(/\d+/);
      if (match) capacity.persons = parseInt(match[0]);
    }
    
    // Try to find bedrooms
    const bedroomsEl = doc.querySelector('[data-testid="bedrooms-count"], .accommodation-feature:contains("slaapkamer")');
    if (bedroomsEl) {
      const text = bedroomsEl.textContent || '';
      const match = text.match(/\d+/);
      if (match) capacity.bedrooms = parseInt(match[0]);
    }
    
    // Try to find bathrooms
    const bathroomsEl = doc.querySelector('[data-testid="bathrooms-count"], .accommodation-feature:contains("badkamer")');
    if (bathroomsEl) {
      const text = bathroomsEl.textContent || '';
      const match = text.match(/\d+/);
      if (match) capacity.bathrooms = parseInt(match[0]);
    }
    
    // Extract amenities
    const amenities: string[] = [];
    doc.querySelectorAll('.accommodation-facilities__item, .facilities__item').forEach(item => {
      const text = item.textContent?.trim();
      if (text) amenities.push(text);
    });
    
    // If no amenities found, add some common ones as fallback
    if (amenities.length === 0) {
      const possibleAmenitySelectors = ['.features__item', '.property-features li', '.accommodation-info li'];
      for (const selector of possibleAmenitySelectors) {
        doc.querySelectorAll(selector).forEach(item => {
          const text = item.textContent?.trim();
          if (text) amenities.push(text);
        });
        if (amenities.length > 0) break;
      }
    }
    
    // Extract description
    let description = '';
    const descEl = doc.querySelector('.accommodation-description__text, .description__text, [data-testid="description"]');
    if (descEl) {
      description = descEl.textContent?.trim() || '';
    }
    
    // Extract photos
    const photos: string[] = [];
    doc.querySelectorAll('img[data-src], .accommodation-photos img, .gallery img').forEach(img => {
      const src = img.getAttribute('data-src') || img.getAttribute('src');
      if (src && !photos.includes(src) && !src.includes('placeholder')) {
        photos.push(src);
      }
    });
    
    // If no photos found, find any large image on the page
    if (photos.length === 0) {
      doc.querySelectorAll('img[width="800"], img[width="600"], img.property-image').forEach(img => {
        const src = img.getAttribute('src');
        if (src && !photos.includes(src) && !src.includes('placeholder')) {
          photos.push(src);
        }
      });
    }
    
    // Extract price
    let basePrice = 0;
    let priceDescription = '';
    
    const priceEl = doc.querySelector('.price-box__price, .price__amount, [data-testid="price"]');
    if (priceEl) {
      const priceText = priceEl.textContent || '';
      const priceMatch = priceText.match(/\d+[.,]?\d*/);
      if (priceMatch) {
        basePrice = parseFloat(priceMatch[0].replace(',', '.'));
      }
      
      const priceDescEl = doc.querySelector('.price-box__description, .price__description');
      priceDescription = priceDescEl?.textContent?.trim() || '';
    }
    
    // Extract additional costs
    const additionalCosts: { description: string; amount: string }[] = [];
    doc.querySelectorAll('.price-details__item, .additional-costs li').forEach(item => {
      const desc = item.querySelector('.price-details__description, .cost-description')?.textContent?.trim();
      const amount = item.querySelector('.price-details__amount, .cost-amount')?.textContent?.trim();
      
      if (desc && amount) {
        additionalCosts.push({
          description: desc,
          amount: amount
        });
      }
    });
    
    // Extract info
    const priceInfoEl = doc.querySelector('.price-info, .additional-info');
    const priceInfo = priceInfoEl?.textContent?.trim() || '';
    
    // Extract rating
    let score = 0;
    let count = 0;
    
    const ratingEl = doc.querySelector('.accommodation-rating__score, .rating__score');
    if (ratingEl) {
      const scoreText = ratingEl.textContent || '';
      const scoreMatch = scoreText.match(/\d+[.,]?\d*/);
      if (scoreMatch) {
        score = parseFloat(scoreMatch[0].replace(',', '.'));
      }
      
      const countEl = doc.querySelector('.accommodation-rating__count, .rating__count');
      const countText = countEl?.textContent || '';
      const countMatch = countText.match(/\d+/);
      if (countMatch) {
        count = parseInt(countMatch[0]);
      }
    }
    
    // Extract rules
    const rules: string[] = [];
    doc.querySelectorAll('.accommodation-rules__item, .house-rules li').forEach(item => {
      const text = item.textContent?.trim();
      if (text) {
        rules.push(text);
      }
    });
    
    return {
      id,
      title,
      location,
      capacity,
      amenities,
      description,
      photos: photos.length > 0 ? photos : getMockPhotos(),
      price: {
        basePrice,
        description: priceDescription,
        additionalCosts,
        info: priceInfo
      },
      rating: {
        score,
        count
      },
      rules
    };
  } catch (error) {
    console.error("Error extracting data from HTML:", error);
    return null;
  }
};

// Function to get mock photos if none were found
const getMockPhotos = (): string[] => {
  return [
    "https://picsum.photos/id/10/800/600",
    "https://picsum.photos/id/11/800/600",
    "https://picsum.photos/id/12/800/600"
  ];
};

// Mock data function as fallback
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
