// =============================================================================
// Webhook Service for External Integrations
// =============================================================================

import {db} from '@/lib/db';
import type {WebhookEvent} from './types';
import crypto from 'crypto';

export interface WebhookDeliveryResult {
  success: boolean;
  statusCode?: number;
  response?: string;
  error?: string;
}

/**
 * Trigger webhooks for a specific event
 */
export async function triggerWebhooks(
  event: WebhookEvent,
  data: Record<string, any>
): Promise<void> {
  // Find all active webhooks subscribed to this event
  const webhooks = await db.webhook.findMany({
    where: {
      isActive: true,
    },
  });
  
  // Filter webhooks that subscribe to this event
  const subscribedWebhooks = webhooks.filter(webhook => {
    try {
      const events = JSON.parse(webhook.events || '[]');
      return events.includes(event);
    } catch {
      return false;
    }
  });
  
  // Trigger each webhook
  for (const webhook of subscribedWebhooks) {
    // Create async delivery job
    deliverWebhook(webhook.id, event, data).catch(console.error);
  }
}

/**
 * Deliver a webhook with retry logic
 */
async function deliverWebhook(
  webhookId: string,
  event: WebhookEvent,
  data: Record<string, any>
): Promise<void> {
  const webhook = await db.webhook.findUnique({
    where: { id: webhookId },
  });
  
  if (!webhook) return;
  
  // Build payload
  const payload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };
  
  // Parse headers
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Webhook-Event': event,
    'X-Webhook-ID': webhookId,
  };
  
  if (webhook.headers) {
    try {
      const customHeaders = JSON.parse(webhook.headers);
      headers = { ...headers, ...customHeaders };
    } catch {
      // Use default headers
    }
  }
  
  // Add signature if secret is configured
  if (webhook.secret) {
    const signature = generateSignature(JSON.stringify(payload), webhook.secret);
    headers['X-Webhook-Signature'] = signature;
  }
  
  // Create event record
  const eventRecord = await db.webhookEvent.create({
    data: {
      webhookId,
      event,
      payload: JSON.stringify(payload),
      status: 'pending',
    },
  });
  
  // Attempt delivery with retries
  let lastError: string | undefined;
  let statusCode: number | undefined;
  
  for (let attempt = 0; attempt <= webhook.retryCount; attempt++) {
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000), // 30s timeout
      });
      
      statusCode = response.status;
      const responseBody = await response.text();
      
      if (response.ok) {
        // Success
        await db.webhookEvent.update({
          where: { id: eventRecord.id },
          data: {
            status: 'success',
            statusCode,
            response: responseBody.substring(0, 1000),
            sentAt: new Date(),
            attempts: attempt + 1,
          },
        });
        
        await db.webhook.update({
          where: { id: webhookId },
          data: {
            successCount: { increment: 1 },
            lastTriggered: new Date(),
            lastSuccess: new Date(),
          },
        });
        
        return;
      } else {
        lastError = `HTTP ${statusCode}: ${responseBody.substring(0, 200)}`;
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error';
    }
    
    // Wait before retry
    if (attempt < webhook.retryCount) {
      await sleep(webhook.retryDelay * Math.pow(2, attempt)); // Exponential backoff
    }
  }
  
  // Failed after all retries
  await db.webhookEvent.update({
    where: { id: eventRecord.id },
    data: {
      status: 'failed',
      statusCode,
      error: lastError,
      attempts: webhook.retryCount + 1,
    },
  });
  
  await db.webhook.update({
    where: { id: webhookId },
    data: {
      failureCount: { increment: 1 },
      lastTriggered: new Date(),
      lastFailure: new Date(),
    },
  });
}

/**
 * Generate HMAC signature for webhook
 */
function generateSignature(payload: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return `sha256=${hmac.digest('hex')}`;
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Create a new webhook
 */
export async function createWebhook(data: {
  name: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  headers?: Record<string, string>;
  retryCount?: number;
  retryDelay?: number;
}): Promise<string> {
  const webhook = await db.webhook.create({
    data: {
      name: data.name,
      url: data.url,
      events: JSON.stringify(data.events),
      secret: data.secret,
      headers: data.headers ? JSON.stringify(data.headers) : null,
      retryCount: data.retryCount ?? 3,
      retryDelay: data.retryDelay ?? 1000,
    },
  });
  
  return webhook.id;
}

/**
 * Get webhooks with stats
 */
export async function getWebhooks() {
  const webhooks = await db.webhook.findMany({
    orderBy: { createdAt: 'desc' },
  });
  
  return webhooks.map(w => ({
    ...w,
    events: w.events ? JSON.parse(w.events) : [],
    headers: w.headers ? JSON.parse(w.headers) : {},
  }));
}

/**
 * Get webhook delivery history
 */
export async function getWebhookHistory(
  webhookId: string,
  limit: number = 50
) {
  const events = await db.webhookEvent.findMany({
    where: { webhookId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  
  return events.map(e => ({
    ...e,
    payload: e.payload ? JSON.parse(e.payload) : null,
  }));
}

/**
 * Test a webhook
 */
export async function testWebhook(webhookId: string): Promise<WebhookDeliveryResult> {
  const webhook = await db.webhook.findUnique({
    where: { id: webhookId },
  });
  
  if (!webhook) {
    return { success: false, error: 'Webhook not found' };
  }
  
  // Send a test event
  const testPayload = {
    event: 'PAGE_PUBLISHED',
    timestamp: new Date().toISOString(),
    data: {
      test: true,
      message: 'This is a test webhook delivery',
    },
  };
  
  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Event': 'TEST',
        'X-Webhook-ID': webhookId,
      },
      body: JSON.stringify(testPayload),
      signal: AbortSignal.timeout(30000),
    });
    
    const responseBody = await response.text();
    
    return {
      success: response.ok,
      statusCode: response.status,
      response: responseBody.substring(0, 500),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
