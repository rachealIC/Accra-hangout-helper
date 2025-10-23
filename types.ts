// Fix: Replaced incorrect constant definitions with proper type exports.
// This resolves circular dependency issues and defines the types used throughout the application.
export type Vibe =
  | 'Relax & Unwind'
  | 'Food & Nightlife'
  | 'Arts & Culture'
  | 'Active & Adventure'
  | 'Shopping & Markets'
  | 'Romantic Date'
  | 'Picnic & Parks'
  | '';

export type TimeWindow =
  | 'Quickie (1-2 hours)'
  | 'Half-Day Sesh (3-4 hours)'
  | 'The Main Event (5+ hours)'
  | 'A Whole Day Trip (8+ hours)'
  | '';

export type Budget = 'Basically Free' | 'Mid-Range' | 'Feeling Fancy' | '';

export type Audience = 'Solo Mission' | 'With the Crew' | 'Just the Two of Us' | "It's a Double Date" | '';

export type Timing = 'Right Now!' | 'Later Today' | 'Sometime This Week' | '';

export type DateMeal = 'Breakfast' | 'Lunch' | 'Dinner' | '';

export type Location = {
  latitude: number;
  longitude: number;
} | null;

export interface HangoutParams {
  vibe: Vibe;
  timeWindow: TimeWindow;
  budget: Budget;
  audience: Audience;
  timing: Timing;
  location: Location;
  proximity?: 'close' | 'any';
  dateMeal?: DateMeal;
}

export interface HistoryItem {
  id: string;
  type: 'user' | 'ai';
  label: string;
  content: string;
}