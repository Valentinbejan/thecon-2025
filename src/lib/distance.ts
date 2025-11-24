// src/lib/distance.ts

/**
 * Calculate distance between two points using Haversine formula
 * @returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance);
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Get distance label for display
 */
export function getDistanceLabel(distanceKm: number): string {
  if (distanceKm < 1) {
    return 'Less than 1 km';
  } else if (distanceKm < 10) {
    return `${distanceKm} km`;
  } else if (distanceKm < 50) {
    return `~${Math.round(distanceKm / 5) * 5} km`;
  } else if (distanceKm < 100) {
    return `~${Math.round(distanceKm / 10) * 10} km`;
  } else {
    return `${Math.round(distanceKm)} km`;
  }
}
