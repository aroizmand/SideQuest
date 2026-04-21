export const CATEGORIES = [
  { id: 1,  name: 'Hiking',                  iconSlug: 'hiking' },
  { id: 2,  name: 'Trail Running',            iconSlug: 'trail-running' },
  { id: 3,  name: 'Cycling',                  iconSlug: 'cycling' },
  { id: 4,  name: 'Watersports',              iconSlug: 'watersports' },
  { id: 5,  name: 'Winter Sports',            iconSlug: 'winter-sports' },
  { id: 6,  name: 'Climbing',                 iconSlug: 'climbing' },
  { id: 7,  name: 'Urban Exploration',        iconSlug: 'urban-exploration' },
  { id: 8,  name: 'Fitness & Workout',        iconSlug: 'fitness' },
  { id: 9,  name: 'Food Adventure',           iconSlug: 'food-adventure' },
  { id: 10, name: 'Photography Walk',         iconSlug: 'photography' },
  { id: 11, name: 'Travel & Day Trip',        iconSlug: 'travel' },
  { id: 12, name: 'Outdoor Arts & Culture',   iconSlug: 'arts-outdoor' },
  { id: 13, name: 'Motorsports',              iconSlug: 'motorsports' },
  { id: 14, name: 'Other Adventure',          iconSlug: 'other' },
] as const;

export type CategoryName = typeof CATEGORIES[number]['name'];
