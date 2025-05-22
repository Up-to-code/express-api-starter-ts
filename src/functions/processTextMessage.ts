import { logWithTimestamp } from '../utils/logger';
import { sendWhatsAppMessage } from './sendWhatsAppMessage';
import generateResponse from './generateResponse';
import getSenderName from './getSenderName';
import { WhatsAppMessage } from '../interfaces/WhatsAppMessageTypes';

/**
 * Processes a text message received from WhatsApp
 *
 * This function handles the complete flow of processing a text message:
 * 1. Extracts message details (sender, text content)
 * 2. Gets the sender's name from the webhook data
 * 3. Generates an appropriate response
 * 4. Sends the response back to the sender
 * 5. Logs the result
 *
 * @param {WhatsAppMessage} message - The WhatsApp message object
 * @param {any} value - The value object from the webhook containing additional data
 * @returns {Promise<void>} A promise that resolves when processing is complete
 *
 * @throws Will log errors but not throw them to prevent webhook failures
 *
 * @example
 * // In a webhook handler
 * if (message.type === 'text' && message.text) {
 *   await processTextMessage(message, value);
 * }
 */
async function processTextMessage(message: WhatsAppMessage, value: any): Promise<void> {
  // Skip processing if not a text message or text is missing
  if (!message.text) return;

  const from = message.from;
  const text = message.text.body;
  const senderName = getSenderName(value, from);

  logWithTimestamp(`Received text message from ${from}`, 'info');

  // Generate and send response
  const response = await generateResponse(text, from, senderName);

  const sent = await sendWhatsAppMessage(from, response);

  if (sent) {
    logWithTimestamp('Reply sent successfully', 'success');
  } else {
    logWithTimestamp('Failed to send reply', 'error');
  }
}
export { processTextMessage };
