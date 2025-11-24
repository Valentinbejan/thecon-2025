// src/data/cities.ts

export interface CityData {
  name: string;
  lat: number;
  long: number;
}

export const ROMANIAN_CITIES: CityData[] = [
  { name: 'Bucharest', lat: 44.4268, long: 26.1025 },
  { name: 'Cluj-Napoca', lat: 46.7712, long: 23.6236 },
  { name: 'Timișoara', lat: 45.7489, long: 21.2087 },
  { name: 'Iași', lat: 47.1585, long: 27.6014 },
  { name: 'Brașov', lat: 45.6427, long: 25.5887 },
  { name: 'Constanța', lat: 44.1598, long: 28.6348 },
  { name: 'Sibiu', lat: 45.7983, long: 24.1256 },
  { name: 'Oradea', lat: 47.0458, long: 21.9183 },
  { name: 'Galați', lat: 45.4353, long: 28.0080 },
  { name: 'Craiova', lat: 44.3302, long: 23.7949 },
  { name: 'Ploiești', lat: 44.9364, long: 26.0138 },
  { name: 'Alba Iulia', lat: 46.0677, long: 23.5700 },
  { name: 'Târgu Mureș', lat: 46.5386, long: 24.5579 },
  { name: 'Arad', lat: 46.1866, long: 21.3123 },
  { name: 'Pitești', lat: 44.8565, long: 24.8692 },
  { name: 'Bacău', lat: 46.5670, long: 26.9146 },
  { name: 'Baia Mare', lat: 47.6567, long: 23.5850 },
  { name: 'Buzău', lat: 45.1500, long: 26.8333 },
  { name: 'Satu Mare', lat: 47.7928, long: 22.8857 },
  { name: 'Suceava', lat: 47.6514, long: 26.2556 },
];

export const getCityByName = (name: string): CityData | undefined => {
  return ROMANIAN_CITIES.find(city => city.name === name);
};
