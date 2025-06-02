import { logWithTimestamp } from '../utils/logger';
import { callWhatsAppAPI } from './callWhatsAppAPI';
import { getWhatsAppConfig } from './Configuration';
import { MessageTrackingService } from '../services/messageTrackingService';

/**
 * Enhanced WhatsApp message sending result
 */
interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Sends a text message to a WhatsApp user with read receipt tracking
 *
 * This function handles the complete flow of sending a WhatsApp message:
 * 1. Gets the WhatsApp configuration (phone number ID and access token)
 * 2. Calls the WhatsApp API to send the message with read receipt tracking
 * 3. Tracks the message for delivery and read status updates
 * 4. Logs the result
 *
 * @param {string} to - The recipient's phone number in international format
 * @param {string} text - The text message to send
 * @param {string} internalMessageId - Internal database message ID for tracking
 * @param {boolean} trackReadReceipts - Whether to track read receipts (default: true)
 * @param {boolean} isAutomated - Whether this is an automated response (default: false)
 * @param {string} responseSource - Source of the response (QA Database, AI Agent, etc.)
 * @returns {Promise<SendMessageResult>} A promise that resolves to the send result with message ID
 *
 * @example
 * // Send a message to a user with tracking
 * const result = await sendWhatsAppMessage(
 *   '+1234567890',
 *   'Hello, world!',
 *   'internal-msg-123',
 *   true,
 *   true,
 *   'AI Agent'
 * );
 * if (result.success) {
 *   console.log('Message sent successfully with ID:', result.messageId);
 * } else {
 *   console.error('Failed to send message:', result.error);
 * }
 */
async function sendWhatsAppMessage(
  to: string,
  text: string,
  internalMessageId?: string,
  trackReadReceipts: boolean = true,
  isAutomated: boolean = false,
  responseSource?: string
): Promise<SendMessageResult> {
  try {
    const { phoneNumberId, accessToken } = getWhatsAppConfig();

    // Send message with read receipt tracking
    const { response, messageId } = await callWhatsAppAPI(
      phoneNumberId,
      accessToken,
      to,
      text,
      trackReadReceipts
    );

    // Track the message if internal ID is provided
    if (internalMessageId && messageId) {
      await MessageTrackingService.trackSentMessage(
        messageId,
        internalMessageId,
        to,
        text,
        isAutomated,
        responseSource
      );
    }

    logWithTimestamp(
      `📤 Message sent successfully to ${to} (ID: ${messageId}) ${responseSource ? `[${responseSource}]` : ''}`,
      'success'
    );

    return {
      success: true,
      messageId
    };
  } catch (error: any) {
    const errorMessage = `Failed to send WhatsApp message: ${error.message}`;
    logWithTimestamp(errorMessage, 'error');

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Legacy function for backward compatibility
 */
async function sendWhatsAppMessageLegacy(to: string, text: string): Promise<boolean> {
  const result = await sendWhatsAppMessage(to, text);
  return result.success;
}
export { sendWhatsAppMessage };