/* eslint-disable @typescript-eslint/semi */
import { WhatsAppWebhook } from '../interfaces/WhatsAppMessageTypes';

/**
 * Validates the structure of a WhatsApp webhook payload
 *
 * This function checks if the webhook payload has the required structure
 * according to the WhatsApp Business API specifications.
 *
 * @param {WhatsAppWebhook} body - The webhook payload to validate
 * @returns {boolean} True if the webhook structure is valid, false otherwise
 *
 * @example
 * // In a webhook handler
 * const body: WhatsAppWebhook = req.body;
 *
 * if (!isValidWebhookStructure(body)) {
 *   return res.status(400).json({ error: 'Invalid webhook data structure' });
 * }
 */
function isValidWebhookStructure(body: WhatsAppWebhook): boolean {
  return !!(
    body.object !== undefined &&
    body.entry !== undefined &&
    Array.isArray(body.entry) &&
    body.entry.length > 0 &&
    body.entry[0].changes !== undefined &&
    Array.isArray(body.entry[0].changes) &&
    body.entry[0].changes.length > 0
  )
}
export default isValidWebhookStructure;