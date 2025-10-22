import { GoogleGenAI } from '@google/genai';
import type { HangoutParams, Vibe } from '../types';

const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey });

const model = 'gemini-2.5-flash';

const commonInstructions = `
  ROLE: You are "The Accra Vibe Planner", an expert local guide for Accra, Ghana.
  GOAL: Generate creative, fun, and achievable hangout plans.
  TONE: Energetic, fun, witty, and like a knowledgeable local. Use local flavor.
  CONSTRAINTS:
  - Location: All suggestions must be specific, real places in or very close to Accra (Osu, Labone, Jamestown, East Legon, Cantonments, etc.).
  - Quality: Suggest only highly-rated places known for good customer service.
  - Format: The output must be structured exactly as requested below. Do not use asterisks or markdown bold/italics. Use simple text and lists.
`;

export const generatePlanOptions = async (params: HangoutParams) => {
  const { vibe, timeWindow, budget, audience, location, proximity } = params;

  const vibeExplanation: Record<Vibe, string> = {
    'Relax & Unwind': "This means the user wants a low-key, calm experience. Think picnics, quiet cafes, library visits, spa days, or just a cheap and chill hangout.",
    'Food & Nightlife': "The user is looking for great food or a fun night out. Suggest top-rated restaurants, cool bars with live music, brunch spots, etc.",
    'Arts & Culture': "Focus on historical sites, art galleries, museums, and creative workshops.",
    'Active & Adventure': "Suggest something energetic like go-karting, paintball, hiking, beach sports, or dance classes.",
    'Shopping & Markets': "Suggest a mix of modern malls, local craft markets like the Arts Centre, and unique boutiques.",
    "I'm Feeling Lucky!": "The user is open to anything! Surprise them with a unique and highly-rated Accra experience that they might not have thought of.",
    '': "No vibe selected."
  };

  let proximityInstruction = '';
  if (proximity === 'close') {
      proximityInstruction = "Crucial Constraint: The suggestions MUST be very close (e.g., within a 5-10 minute drive) to the user's coordinates. Prioritize proximity above all else for this request.";
  }

  const prompt = `
    ${commonInstructions}
    ${proximityInstruction}
    
    I need two distinct hangout options based on these user preferences:
    - Vibe: ${vibe} (${vibeExplanation[vibe] || ''})
    - Duration: ${timeWindow}
    - Budget: ${budget}
    - Who's going: ${audience}
    - User's general area: Near latitude ${location?.latitude}, longitude ${location?.longitude}

    For each of the two options, provide the following:
    1. The specific name of the main venue or location for the plan.
    2. The Google Maps rating (e.g., "Rating: 4.5/5 stars"). If unavailable, state "Rating: Not available".
    3. A fun, detailed, and realistic description of the activities. The description must be concise and a maximum of 3 lines.
    4. An estimated per-person cost in Ghanaian Cedis (GH₵).
    5. A short, useful pro-tip.

    Required Output Format (strictly follow this template, separating the two options and the recommendation with "---"):

    OPTION 1
    Title: [Specific Venue Name for Plan 1]
    Rating: [Google Maps Rating for main venue]
    Description: [Detailed description of activities for plan 1]
    Cost: [Estimated cost per person for plan 1]
    Pro-Tip: [Pro-tip for plan 1]
    ---
    OPTION 2
    Title: [Specific Venue Name for Plan 2]
    Rating: [Google Maps Rating for main venue]
    Description: [Detailed description of activities for plan 2]
    Cost: [Estimated cost per person for plan 2]
    Pro-Tip: [Pro-tip for plan 2]
    ---
    Recommendation: [Your brief recommendation on which to pick based on reviews, vibe, etc. This must also be concise and a maximum of 3 lines.]
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: location ? { retrievalConfig: { latLng: { latitude: location.latitude, longitude: location.longitude } } } : undefined,
      },
    });
    const text = response.text;
    if (!text) throw new Error('No content generated.');
    return text;
  } catch (error) {
    console.error('Error generating plan options:', error);
    throw new Error('Failed to generate hangout options. Please try again.');
  }
};


export const getTravelDetails = async (origin: string, plan: string) => {
    const prompt = `
        A user is starting from "${origin}" and wants to go on the following hangout plan in Accra:
        ---
        ${plan}
        ---
        Based on their starting point, calculate the travel logistics.
        
        Required Output Format (strictly follow this template):

        Travel Estimate
        - Distance: [Estimated distance in km]
        - Travel Time: [Estimated travel time, considering typical Accra traffic for the destination]
        - Traffic: [A brief, helpful comment on the current or expected traffic situation, e.g., "Traffic is usually light around this time," or "Expect heavy traffic on the Spintex Road."]
    `;

    try {
        // This call doesn't need grounding as the destination is in the text.
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        const text = response.text;
        if (!text) throw new Error('No travel details generated.');
        return text;
    } catch (error) {
        console.error('Error generating travel details:', error);
        throw new Error('Failed to generate travel details. Please try again.');
    }
}