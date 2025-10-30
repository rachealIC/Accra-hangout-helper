import { GoogleGenAI } from '@google/genai';
import type { HangoutParams, Vibe } from '../types';

const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey });

const model = 'gemini-2.5-pro';

const commonInstructions = `
  ROLE: You are "The Accra Vibe Planner", an expert local guide for Accra, Ghana.
  GOAL: Generate creative, fun, and achievable hangout plans tailored to user preferences.
  TONE: Energetic, fun, witty, and like a knowledgeable local. Use local flavor and slang where appropriate.
  CONSTRAINTS:
  - Location Search: Search the web, including popular social media like Instagram, for the best and most interesting hideouts, restaurants, beaches, and event spots across the entire Greater Accra Region. Accra is a large and diverse city, so find unique and highly-rated places beyond the most obvious neighborhoods.
  - Be Comprehensive: Your suggestions should be diverse. Include popular mainstream spots like Silverbird Cinemas for movies, but also use your web search capabilities to find timely, specific events. For example, if there is a well-known play by Roverman Productions (Uncle Ebo Whyte) happening within the next week, that is an excellent, high-quality suggestion. Be creative and inclusive in your suggestions.
  - Quality: Suggest only highly-rated places known for good customer service.
  - Format: The output must be structured exactly as requested below. Do not use asterisks or markdown bold/italics. Use simple text and lists.
`;

export const generatePlanOptions = async (params: HangoutParams) => {
  const { vibe, timeWindow, budget, audience, location, proximity, timing, dateMeal } = params;

  const vibeExplanation: Record<Vibe, string> = {
    'Relax & Unwind': "This means the user wants a low-key, calm experience. Think quiet cafes, library visits, spa days, or just a cheap and chill hangout.",
    'Food & Nightlife': "The user is looking for great food or a fun night out. Suggest top-rated restaurants, cool bars with live music, brunch spots, etc.",
    'Arts & Culture': "Focus on historical sites, art galleries, museums, and creative workshops.",
    'Active & Adventure': "Suggest something energetic like go-karting, paintball, hiking, beach sports, or dance classes.",
    'Movies & Plays': "The user wants to see a movie or a live performance. Use your web search capabilities to find current movie listings at popular cinemas like Silverbird, as well as any upcoming plays (like those from Roverman Productions) or comedy shows happening in Accra within the current week or month. This requires timely, event-based information.",
    'Romantic Date': "This is for a romantic date. Prioritize places with a cozy, intimate ambiance, excellent customer service, and a great atmosphere for conversation. The user has specified if it's for breakfast, lunch, or dinner.",
    'Picnic & Parks': "The user wants a picnic. Suggest specific, neat, and quiet parks or beaches suitable for a picnic. This option needs extra details.",
    '': "No vibe selected."
  };

  let proximityInstruction = '';
  if (proximity === 'close') {
      proximityInstruction = "Crucial Constraint: The suggestions MUST be very close (e.g., within a 5-10 minute drive) to the user's coordinates. Prioritize proximity above all else for this request.";
  }
  
  let timingInstruction = '';
  if (timing === 'Right Now!') {
    const now = new Date();
    const formattedTime = now.toLocaleString('en-US', {
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
    timingInstruction = `Crucial Context: The user wants to go "Right Now!". The current time is approximately ${formattedTime}. Please factor this in. Suggest places that are likely open and accessible at this moment. Also, consider the typical traffic patterns in Accra for this specific time and day. CRITICAL CONSTRAINT: Do NOT suggest any venue that is likely to be closed at this time. Use your web search to verify opening hours.`;
  } else if (timing === 'Sometime This Week') {
      timingInstruction = `Crucial Context: The user wants to go 'Sometime This Week'. The plan should include forward-looking advice. For instance, the "Pro-Tip" should contain information relevant to planning ahead, such as "It's best to book a table for weekend evenings" or "Check their Instagram page for live music schedules before you go."`;
  }
  
  const dateMealInstruction = vibe === 'Romantic Date' && dateMeal ? `- Date Meal: It's for ${dateMeal}.` : '';

  const picnicInstructions = vibe === 'Picnic & Parks' 
    ? `9. A "Picnic Essentials" section with a bulleted list of items to bring and suggested activities (maximum of 4 bullet points).`
    : '';
  
  const picnicFormat = vibe === 'Picnic & Parks'
    ? `Picnic Essentials:
- [Bulleted list item 1 for essentials]
- [Bulleted list item 2 for essentials]
- [Bulleted list item 3 for essentials]
- [Bulleted list item 4 for essentials]`
    : '';

  const prompt = `
    ${commonInstructions}
    ${proximityInstruction}
    ${timingInstruction}
    
    I need two distinct hangout options based on these user preferences:
    - Vibe: ${vibe} (${vibeExplanation[vibe] || ''})
    - Duration: ${timeWindow}
    - Budget: ${budget}
    - Who's going: ${audience}
    - When: ${timing}
    ${dateMealInstruction}
    - User's general area: Near latitude ${location?.latitude}, longitude ${location?.longitude}

    For each of the two options, provide the following:
    1. The specific name of the main venue or location for the plan.
    2. A specific, searchable location for the venue. This must be a full address or a well-known landmark name that can be accurately found on Google Maps (e.g., "Republic Bar & Grill, Osu, Accra" or "Kwame Nkrumah Memorial Park & Mausoleum"). Do NOT just provide a general neighborhood.
    3. The Google Maps rating (e.g., "Rating: 4.5/5 stars"). If unavailable, state "Rating: Not available".
    4. The opening hours for the venue (e.g., "9:00 AM - 10:00 PM"). If unavailable, state "Not available".
    5. An "Essentials Checklist" with the following details, each on a new line starting with a hyphen:
       - Dress Code: [e.g., Casual, Smart Casual, No sandals.]
       - Noise Level: [e.g., Quiet, Moderate, Lively, Loud.]
       - Seating: [e.g., Private tables, Communal benches, Limited seating.]
    6. A fun, detailed, and realistic description of the activities. The description must be concise and a maximum of 3 lines.
    7. An estimated per-person cost in Ghanaian Cedis (GH₵).
    8. A short, useful pro-tip.
    ${picnicInstructions}

    Required Output Format (strictly follow this template, separating the two options and the recommendation with "---"):

    OPTION 1
    Title: [Specific Venue Name for Plan 1]
    Location: [Specific, searchable location for Plan 1]
    Rating: [Google Maps Rating for main venue]
    Opening Hours: [Opening hours for main venue]
    Essentials Checklist:
    - Dress Code: [Details]
    - Noise Level: [Details]
    - Seating: [Details]
    Description: [Detailed description of activities for plan 1]
    Cost: [Estimated cost per person for plan 1]
    Pro-Tip: [Pro-tip for plan 1]
    ${picnicFormat}
    ---
    OPTION 2
    Title: [Specific Venue Name for Plan 2]
    Location: [Specific, searchable location for Plan 2]
    Rating: [Google Maps Rating for main venue]
    Opening Hours: [Opening hours for main venue]
    Essentials Checklist:
    - Dress Code: [Details]
    - Noise Level: [Details]
    - Seating: [Details]
    Description: [Detailed description of activities for plan 2]
    Cost: [Estimated cost per person for plan 2]
    Pro-Tip: [Pro-tip for plan 2]
    ${picnicFormat}
    ---
    Recommendation: [Your brief recommendation on which to pick based on reviews, vibe, etc. This must be strictly one single line.]
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
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
    const now = new Date();
    const formattedTime = now.toLocaleString('en-US', {
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });

    const prompt = `
        A user is starting from "${origin}" and wants to go on the following hangout plan in Accra:
        ---
        ${plan}
        ---
        The current time is ${formattedTime}. Based on their starting point and the current time, calculate the travel logistics.
        
        Required Output Format (strictly follow this template):

        Title: Travel Details
        Travel Estimate:
        - Distance: [Estimated distance in km]
        - Travel Time: [Estimated travel time, considering typical Accra traffic for the destination at this specific time]
        - Traffic: [A brief, helpful comment on the current or expected traffic situation based on the time, e.g., "Traffic is usually light around this time," or "Expect heavy traffic on the Spintex Road as it is rush hour."]
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