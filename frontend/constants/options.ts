export const GENDER_OPTIONS = [
  { label: 'Man',              value: 'man' },
  { label: 'Woman',            value: 'woman' },
  { label: 'Non-binary',       value: 'non_binary' },
  { label: 'Prefer not to say',value: 'prefer_not_to_say' },
] as const;

export const GENDER_RESTRICTION_OPTIONS = [
  { label: 'Everyone',          value: 'all' },
  { label: 'Women only',        value: 'women_only' },
  { label: 'Men only',          value: 'men_only' },
  { label: 'Non-binary welcome',value: 'non_binary_welcome' },
] as const;

export const DISTANCE_OPTIONS = [
  { label: '5 km',  value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
] as const;

export const CALGARY_BOUNDS = {
  northEast: { lat: 51.2133, lng: -113.8957 },
  southWest: { lat: 50.8427, lng: -114.2716 },
  center:    { lat: 51.0447, lng: -114.0719 },
};
