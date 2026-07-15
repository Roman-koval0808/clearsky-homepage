/**
 * /api-signals/gmail-webhook
 *
 * Alias route — Google Pub/Sub is configured to POST here.
 * All logic lives in src/routes/ai-signals/gmail-webhook/+server.ts;
 * this file simply re-exports the handler so both URLs work.
 */
export { POST } from '../../ai-signals/gmail-webhook/+server';
