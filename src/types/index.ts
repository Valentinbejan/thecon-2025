export interface Venue {
  id?: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    long: number;
  };
  image_url: string;
  short_description: string;
  rating: number;
  city?: string;
  category?: string;
  cuisine?: string[];
  atmosphere?: string[];
  features?: string[];
  // Calculated field for distance from user
  distanceFromUser?: number;
}

export interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  website?: string;
  email?: string;
  city?: string;
  city_lat?: number;
  city_long?: number;
  updated_at?: Date;
}

export interface UserLocation {
  city: string;
  lat: number;
  long: number;
}
