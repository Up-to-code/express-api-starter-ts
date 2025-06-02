import { logWithTimestamp } from '../utils/logger';
import { sendWhatsAppMessage } from './sendWhatsAppMessage';
import generateResponse from './generateResponse';
import getSenderName from './getSenderName';
import { WhatsAppMessage } from '../interfaces/WhatsAppMessageTypes';
import { MessageTrackingService } from '../services/messageTrackingService';



/**
 * Processes a text message received from WhatsApp with enhanced tracking
 *
 * This function handles the complete flow of processing a text message:
 * 1. Extracts message details (sender, text content)
 * 2. Gets the sender's name from the webhook data
 * 3. Marks the incoming message as read (sends read receipt)
 * 4. Generates an appropriate response using the intelligent QA/AI system
 * 5. Sends the response back to the sender with tracking
 * 6. Logs the complete flow with source information
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
  try {
    // Skip processing if not a text message or text is missing
    if (!message.text) return;

    const from = message.from;
    const text = message.text.body;
    const senderName = getSenderName(value, from);

    logWithTimestamp(
      `📨 Received text message from ${from} (${senderName}): "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
      'info'
    );

    // Mark incoming message as read (send read receipt)
    await MessageTrackingService.markAsRead(message.id);

    // Generate intelligent response using QA pairs and AI agent
    const response = await generateResponse(text, from, senderName);

    // For now, we'll use the response as-is since generateResponse returns a string
    // The response source tracking is handled internally in generateResponse
    const responseSource = 'Intelligent System'; // This will be enhanced when we modify generateResponse
    const internalMessageId = ''; // This will be set when we get the message ID from saveMessage

    // Send response with enhanced tracking
    const sendResult = await sendWhatsAppMessage(
      from,
      response,
      internalMessageId,
      true, // Track read receipts
      true, // This is an automated response
      responseSource
    );

    if (sendResult.success) {
      logWithTimestamp(
        `✅ Reply sent successfully to ${from} [${responseSource}] (WhatsApp ID: ${sendResult.messageId})`,
        'success'
      );
    } else {
      logWithTimestamp(
        `❌ Failed to send reply to ${from}: ${sendResult.error}`,
        'error'
      );
    }

  } catch (error: any) {
    logWithTimestamp(
      `❌ Error processing text message from ${message.from}: ${error.message}`,
      'error'
    );

    // Try to send a fallback error message
    try {
      await sendWhatsAppMessage(
        message.from,
        'Sorry, there was an error processing your message. Please try again later.',
        undefined,
        true,
        true,
        'Error Fallback'
      );
    } catch (fallbackError: any) {
      logWithTimestamp(
        `❌ Failed to send fallback error message: ${fallbackError.message}`,
        'error'
      );
    }
  }
}
export { processTextMessage };
