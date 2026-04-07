/**
 * POST /api/guesty/webhook
 * Receives Guesty webhook events and dispatches to Supabase.
 *
 * Events handled:
 * - reservation.created / updated / canceled / checked_in / checked_out
 * - listing.updated
 * - message.created
 *
 * Webhook URL to register in Guesty: https://your-domain.com/api/guesty/webhook
 * Security: Guesty sends a secret header — validate with GUESTY_WEBHOOK_SECRET env var.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { GuestyWebhookPayload } from '@/lib/guesty';

export const dynamic = 'force-dynamic';

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Validate Guesty webhook secret if configured
    const webhookSecret = process.env.GUESTY_WEBHOOK_SECRET;
    if (webhookSecret) {
      const incomingSecret = req.headers.get('x-guesty-signature') ?? req.headers.get('authorization');
      if (incomingSecret !== webhookSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const payload = await req.json() as GuestyWebhookPayload;
    const { event, data } = payload;

    console.log(`[webhook] Received: ${event}`);

    const supabase = getAdminSupabase();

    switch (event) {
      case 'reservation.created':
      case 'reservation.updated':
      case 'reservation.canceled':
      case 'reservation.checked_in':
      case 'reservation.checked_out': {
        const res = data.reservation;
        if (res?._id) {
          await supabase
            .from('guesty_webhook_events')
            .insert({
              event,
              reservation_id: res._id,
              listing_id: res.listingId,
              status: res.status,
              payload: JSON.stringify(payload),
              received_at: new Date().toISOString(),
            });
        }
        break;
      }
      case 'listing.updated': {
        const listing = data.listing;
        if (listing?._id) {
          await supabase
            .from('guesty_webhook_events')
            .insert({
              event,
              listing_id: listing._id,
              payload: JSON.stringify(payload),
              received_at: new Date().toISOString(),
            });
        }
        break;
      }
      default:
        console.log(`[webhook] Unhandled event: ${event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[/api/guesty/webhook]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
