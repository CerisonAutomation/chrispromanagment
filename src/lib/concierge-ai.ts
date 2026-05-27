import { supabase } from '../integrations/supabase/client';

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
): Promise<string | undefined> {
  const { data, error } = await supabase.functions.invoke('concierge-ai', {
    body: { messages, userContext },
  });

  if (error) {
    throw new Error(`Failed to get concierge response: ${error.message}`);
  }

  return data?.message;
}
