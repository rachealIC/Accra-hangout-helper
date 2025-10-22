import { Vibe, TimeWindow, Budget, Audience, Timing } from './types';

export const VIBE_OPTIONS: Vibe[] = [
  'Relax & Unwind',
  'Food & Nightlife',
  'Arts & Culture',
  'Active & Adventure',
  'Shopping & Markets',
  "I'm Feeling Lucky!",
];

export const TIME_WINDOW_OPTIONS: TimeWindow[] = [
  'Quickie (1-2 hours)',
  'Half-Day Sesh (3-4 hours)',
  'The Main Event (5+ hours)',
  'A Whole Day Trip (8+ hours)',
];

export const BUDGET_OPTIONS: { name: Budget, icon: string }[] = [
    { name: 'Basically Free', icon: '💰' },
    { name: 'Mid-Range', icon: '💰💰' },
    { name: 'Feeling Fancy', icon: '💰💰💰' },
];


export const AUDIENCE_OPTIONS: Audience[] = ['Solo Mission', 'With the Crew'];

export const TIMING_OPTIONS: Timing[] = [
  'Right Now!',
  'Later Today',
  'Sometime This Week',
];