import { Vibe, TimeWindow, Budget, Audience, Timing, DateMeal } from './types';

export const VIBE_OPTIONS: Vibe[] = [
  'Relax & Unwind',
  'Food & Nightlife',
  'Arts & Culture',
  'Active & Adventure',
  'Shopping & Markets',
  'Romantic Date',
  'Picnic & Parks',
];

export const TIME_WINDOW_OPTIONS: TimeWindow[] = [
  'Quickie (1-2 hours)',
  'Half-Day Sesh (3-4 hours)',
  'The Main Event (5+ hours)',
  'A Whole Day Trip (8+ hours)',
];

export const BUDGET_OPTIONS: { name: Budget }[] = [
    { name: 'Basically Free' },
    { name: 'Mid-Range' },
    { name: 'Feeling Fancy' },
];


export const AUDIENCE_OPTIONS: Audience[] = ['Solo Mission', 'With the Crew'];

export const TIMING_OPTIONS: Timing[] = [
  'Right Now!',
  'Later Today',
  'Sometime This Week',
];

export const DATE_MEAL_OPTIONS: DateMeal[] = ['Breakfast', 'Lunch', 'Dinner'];