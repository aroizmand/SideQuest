// Max random offset applied to the public "area" coordinates.
// Uniform distribution within a circle — exact pin is never exposed in the feed.
const MAX_FUZZ_KM = 0.5;

export function fuzzeCoords(lat: number, lng: number): { lat_area: number; lng_area: number } {
  const angle = Math.random() * 2 * Math.PI;
  // sqrt for uniform area distribution (avoids clustering near centre)
  const r = Math.sqrt(Math.random()) * MAX_FUZZ_KM;
  const latOffset = (r * Math.cos(angle)) / 111.32;
  const lngOffset = (r * Math.sin(angle)) / (111.32 * Math.cos(lat * (Math.PI / 180)));
  return {
    lat_area: parseFloat((lat + latOffset).toFixed(6)),
    lng_area: parseFloat((lng + lngOffset).toFixed(6)),
  };
}
