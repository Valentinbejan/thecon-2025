export interface Venue {
  id?: string; // Optional since locatii.json doesn't have it
  name: string;
  address: string;
  coordinates: {
    lat: number;
    long: number;
  };
  image_url: string;
  short_description: string;
  rating: number;
}
