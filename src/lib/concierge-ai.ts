export interface ConciergeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function getConciergeResponse(
  messages: ConciergeMessage[],
  userContext: {
    propertyId?: string;
    checkIn?: string;
    checkOut?: string;
  }
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key not configured');

  const systemPrompt = `You are a helpful property management concierge. 
  Assist guests with property questions, local recommendations, and booking support.
  Current context: ${JSON.stringify(userContext)}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) throw new Error('Failed to get concierge response');

  const data = await response.json();
  return data.choices[0].message.content;
}
