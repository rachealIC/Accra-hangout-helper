// Fix: Replaced incorrect constant definitions with proper type exports.
// This resolves circular dependency issues and defines the types used throughout the application.
export type Vibe =
  | 'Relax & Unwind'
  | 'Food & Nightlife'
  | 'Arts & Culture'
  | 'Active & Adventure'
  | 'Shopping & Markets'
  | "I'm Feeling Lucky!"
  | '';

export type TimeWindow =
  | 'Quickie (1-2 hours)'
  | 'Half-Day Sesh (3-4 hours)'
  | 'The Main Event (5+ hours)'
  | 'A Whole Day Trip (8+ hours)'
  | '';

export type Budget = 'Basically Free' | 'Mid-Range' | 'Feeling Fancy' | '';

export type Audience = 'Solo Mission' | 'With the Crew' | '';

export type Timing = 'Right Now!' | 'Later Today' | 'Sometime This Week' | '';

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
}