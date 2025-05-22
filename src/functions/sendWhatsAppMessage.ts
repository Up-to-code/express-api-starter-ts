import { logWithTimestamp } from '../utils/logger';
import { callWhatsAppAPI } from './callWhatsAppAPI';
import { getWhatsAppConfig } from './Configuration';

/**
 * Sends a text message to a WhatsApp user
 *
 * This function handles the complete flow of sending a WhatsApp message:
 * 1. Gets the WhatsApp configuration (phone number ID and access token)
 * 2. Calls the WhatsApp API to send the message
 * 3. Logs the result
 *
 * @param {string} to - The recipient's phone number in international format
 * @param {string} text - The text message to send
 * @returns {Promise<boolean>} A promise that resolves to true if the message was sent successfully, false otherwise
 *
 * @example
 * // Send a message to a user
 * const sent = await sendWhatsAppMessage('+1234567890', 'Hello, world!');
 * if (sent) {
 *   console.log('Message sent successfully');
 * } else {
 *   console.error('Failed to send message');
 * }
 */
async function sendWhatsAppMessage(to: string, text: string): Promise<boolean> {
  try {
    const { phoneNumberId, accessToken } = getWhatsAppConfig();
    await callWhatsAppAPI(phoneNumberId, accessToken, to, text);
    logWithTimestamp(`Message sent successfully to ${to}`, 'success');
    return true;
  } catch (error: any) {
    logWithTimestamp(`Failed to send WhatsApp message: ${error.message}`, 'error');
    return false;
  }
}
export { sendWhatsAppMessage };