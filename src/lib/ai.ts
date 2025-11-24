const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '';

export const generateVibeDescription = async (shortDescription: string): Promise<string> => {
  if (!OPENROUTER_API_KEY) {
    console.warn('OpenRouter API Key not found. Returning original description.');
    return shortDescription;
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://vibescout.app',
        'X-Title': 'VibeScout',
      },
      body: JSON.stringify({
        model: 'moonshotai/kimi-k2-0905',
        messages: [
          {
            role: 'system',
            content: 'You are a creative marketing copywriter. Rewrite the following venue description to be catchy, exciting, and "vibey". Keep it under 50 words.'
          },
          {
            role: 'user',
            content: shortDescription
          }
        ]
      })
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || shortDescription;
  } catch (error) {
    console.error('Error generating vibe description:', error);
    return shortDescription;
  }
};

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const getChatResponse = async (messages: ChatMessage[], context: string): Promise<string> => {
  if (!OPENROUTER_API_KEY) {
    return "I'm sorry, I can't chat right now because my brain (API Key) is missing. 🧠❌";
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://vibescout.app',
        'X-Title': 'VibeScout',
      },
      body: JSON.stringify({
        model: 'moonshotai/kimi-k2-0905',
        messages: [
          {
            role: 'system',
            content: `You are VibeBot, a helpful and enthusiastic assistant for the VibeScout app. 
            You help users find the perfect place to hang out based on their preferences.
            
            Here is the data about available venues:
            ${context}
            
            Rules:
            1. Only recommend venues from the provided data.
            2. Be concise and friendly.
            3. Use emojis! 🌟
            4. If you don't know the answer, say so politely.
            5. When the user has a location set (indicated by distanceKm values), ALWAYS mention how far venues are from them.
            6. Prioritize closer venues when the user asks for recommendations, unless they specifically ask for a certain city or type.
            7. When showing distances, format them nicely (e.g., "just 15 km away" or "about 200 km from you").
            8. If the user asks about places "near me" or "close by", focus on venues within 50-100 km.
            9. If the user hasn't set their location, gently remind them they can set it in their Profile for distance-based recommendations.`
          },
          ...messages
        ]
      })
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || "I'm having trouble thinking right now. 🤔";
  } catch (error) {
    console.error('Error getting chat response:', error);
    return "Oops! Something went wrong. Please try again later. 😅";
  }
};
