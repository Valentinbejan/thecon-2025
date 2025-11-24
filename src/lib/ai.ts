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
        model: 'moonshotai/kimi-k2-thinking',
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
