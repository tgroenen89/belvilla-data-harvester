
export interface BelvillaData {
  id: string;
  title: string;
  location: {
    country: string;
    region: string;
    city: string;
  };
  capacity: {
    persons: number;
    bedrooms: number;
    bathrooms: number;
    area?: number;
    type?: string;
  };
  amenities: string[];
  description: string;
  photos: string[];
  price: {
    basePrice: number;
    description: string;
    additionalCosts: {
      description: string;
      amount: string;
    }[];
    info: string;
  };
  rating: {
    score: number;
    count: number;
  };
  rules: string[];
}
