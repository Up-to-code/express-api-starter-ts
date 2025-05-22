import express, { Request, Response } from 'express';
import { logWithTimestamp } from '../utils/logger';
import { WhatsAppWebhook } from '../interfaces/WhatsAppMessageTypes';
import isValidWebhookStructure from '../functions/isValidWebhookStructure';
import { isValidMessageData } from '../utils/isValidMessageData';
import { processTextMessage } from '../functions/processTextMessage';

const router = express.Router();

/**
 * POST endpoint for receiving webhook notifications from WhatsApp Business API
 *
 * This endpoint handles incoming webhook events from WhatsApp, including:
 * - Text messages from users
 * - Media messages (images, audio, etc.)
 * - Status updates for sent messages
 *
 * The endpoint validates the webhook structure, processes messages,
 * and always returns a 200 OK response to acknowledge receipt.
 *
 * @route POST /api/v1/webhook/whatsapp
 * @param {Request} req - Express request object containing the webhook payload
 * @param {Response} res - Express response object
 * @returns {Response} JSON response indicating success or error
 *
 * @example
 * // Example webhook payload
 * {
 *   "object": "whatsapp_business_account",
 *   "entry": [{
 *     "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
 *     "changes": [{
 *       "value": {
 *         "messaging_product": "whatsapp",
 *         "metadata": {
 *           "display_phone_number": "PHONE_NUMBER",
 *           "phone_number_id": "PHONE_NUMBER_ID"
 *         },
 *         "contacts": [{
 *           "profile": { "name": "CONTACT_NAME" },
 *           "wa_id": "WHATSAPP_ID"
 *         }],
 *         "messages": [{
 *           "from": "SENDER_WHATSAPP_ID",
 *           "id": "MESSAGE_ID",
 *           "timestamp": "TIMESTAMP",
 *           "type": "text",
 *           "text": { "body": "MESSAGE_BODY" }
 *         }]
 *       },
 *       "field": "messages"
 *     }]
 *   }]
 * }
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    logWithTimestamp('Received webhook POST request', 'info');

    // Get webhook data
    const body: WhatsAppWebhook = req.body;

    // Validate webhook structure
    if (!isValidWebhookStructure(body)) {
      logWithTimestamp('Invalid webhook data structure', 'warning');
      return res.status(400).json({ error: 'Invalid webhook data structure' });
    }

    const { value } = body.entry[0].changes[0];

    // Validate message data
    if (!isValidMessageData(value)) {
      logWithTimestamp('Invalid or missing message data in webhook', 'warning');
      return res.status(400).json({ error: 'Invalid or missing message data' });
    }

    // Process each message or status update
    if (value.messages && Array.isArray(value.messages)) {
      for (const message of value.messages) {
        if (message.type === 'text' && message.text) {
          await processTextMessage(message, value);
        } else {
          logWithTimestamp(
            `Received non-text message of type: ${message.type}`,
            'info',
          );
        }
      }
    } else if (value.statuses && Array.isArray(value.statuses)) {
      for (const status of value.statuses) {
        logWithTimestamp(
          `Received status update: ${status.status} for message ${status.id}`,
          'info',
        );
        // Add any status processing logic here if needed
      }
    }

    // Always return 200 OK to WhatsApp to acknowledge receipt
    return res.status(200).json({ status: 'success' });
  } catch (error: any) {
    logWithTimestamp(`Webhook error: ${error.message}`, 'error');
    return res.status(500).json({ error: error.message });
  }
});
export default router;
