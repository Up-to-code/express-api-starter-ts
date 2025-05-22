import { logWithTimestamp } from '../utils/logger';
import findOrCreateClient from './findOrCreateClient';
import updateClientActivity from './updateClientActivity';
import saveMessage from './saveMessage';
import findRelevantQAPairs from './findRelevantQAPairs';
import { detectLanguage } from '../utils/helpers';
import { getDefaultResponse } from './getDefaultResponse';

/**
 * Generates a response to a WhatsApp message
 *
 * This function handles the complete flow of generating a response:
 * 1. Finds or creates a client record in the database
 * 2. Saves the incoming message to the database
 * 3. Updates the client's activity timestamp
 * 4. Finds relevant QA pairs based on the message content
 * 5. Determines the language of the message
 * 6. Generates an appropriate response
 * 7. Saves the bot response to the database
 *
 * @param {string} message - The text message from the user
 * @param {string} from - The sender's phone number
 * @param {string} senderName - The sender's name
 * @returns {Promise<string>} A promise that resolves to the response text
 *
 * @example
 * // Generate a response to a message
 * const response = await generateResponse(
 *   "Hello, what are your business hours?",
 *   "+1234567890",
 *   "John Doe"
 * );
 * console.log(response); // "Our business hours are 9am-5pm Monday to Friday."
 */
async function generateResponse(message: string, from: string, senderName: string): Promise<string> {
  try {
    // Find or create client
    const client = await findOrCreateClient(from, senderName);

    // Save incoming message
    await saveMessage(message, client.id, false);
    await updateClientActivity(client.id, message);

    // Find relevant QA pairs
    const relevantQAs = await findRelevantQAPairs(message);

    // Determine language and generate response
    const language = detectLanguage(message);
    let response = '';

    if (relevantQAs.length > 0) {
      // Use the first matching QA
      response = relevantQAs[0].answer;
      logWithTimestamp(`Found matching QA: ${relevantQAs[0].question}`, 'info');
    } else {
      // Use default response
      response = getDefaultResponse(message, language);
      logWithTimestamp('No matching QA found, using default response', 'info');
    }

    // Save bot response
    await saveMessage(response, client.id, true);
    await updateClientActivity(client.id, response);

    return response;
  } catch (error: any) {
    logWithTimestamp(`Error generating response: ${error.message}`, 'error');
    return 'Sorry, there was an error processing your message. Please try again later.';
  }
}
export default generateResponse;