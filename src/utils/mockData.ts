
import { BelvillaData } from "@/types/belvilla";

/**
 * Returns mock data for a given Belvilla URL
 */
export const getMockData = (url: string): BelvillaData => {
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
    photos: getMockPhotos(),
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

/**
 * Returns mock photos
 */
export const getMockPhotos = (): string[] => {
  return [
    "https://picsum.photos/id/10/800/600",
    "https://picsum.photos/id/11/800/600",
    "https://picsum.photos/id/12/800/600"
  ];
};
