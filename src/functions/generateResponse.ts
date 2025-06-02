import { logWithTimestamp } from '../utils/logger';
import findOrCreateClient from './findOrCreateClient';
import updateClientActivity from './updateClientActivity';
import saveMessage from './saveMessage';
import findRelevantQAPairs, { QAPairWithSimilarity } from './findRelevantQAPairs';
import { detectLanguage } from '../utils/helpers';
import { getDefaultResponse } from './getDefaultResponse';
import { generateAIResponse } from './ai-agent/AIResponseGenerator';

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

    // Find relevant QA pairs with similarity scores
    const relevantQAs: QAPairWithSimilarity[] = await findRelevantQAPairs(message);

    // Determine language and generate response
    const language = detectLanguage(message);
    let response = '';
    let responseSource = '';

    if (relevantQAs.length > 0) {
      const bestMatch = relevantQAs[0];
      const similarityThreshold = 90; // 90% similarity threshold

      if (bestMatch.similarity >= similarityThreshold) {
        // High similarity match - use QA pair response
        response = bestMatch.answer;
        responseSource = `QA Database (${bestMatch.similarity.toFixed(1)}% match)`;
        logWithTimestamp(
          `High similarity match found: "${bestMatch.question}" (${bestMatch.similarity.toFixed(1)}%)`,
          'info'
        );
      } else {
        // Low similarity - use AI agent for intelligent response
        logWithTimestamp(
          `Best QA match only ${bestMatch.similarity.toFixed(1)}% similar. Using AI agent instead.`,
          'info'
        );

        try {
          // Pass client phone number to AI agent for enhanced property search with WhatsApp images
          const aiResponse = await generateAIResponse(message, language, from);
          response = aiResponse.response;
          responseSource = `AI Agent (confidence: ${(aiResponse.confidence * 100).toFixed(1)}%)`;

          // Log enhanced property search results
          if (aiResponse.source === 'enhanced_property_search' && aiResponse.propertySearchResult) {
            logWithTimestamp(
              `Enhanced property search completed: ${aiResponse.propertySearchResult.total} properties found`,
              'success'
            );
          }

          // Add context about available QA pairs if similarity is decent (50-89%)
          if (bestMatch.similarity >= 50) {
            response += `\n\n💡 *Related topic*: ${bestMatch.question}`;
          }
        } catch (aiError: any) {
          logWithTimestamp(`AI Agent failed: ${aiError.message}. Falling back to QA pair.`, 'error');
          response = bestMatch.answer;
          responseSource = `QA Fallback (${bestMatch.similarity.toFixed(1)}% match)`;
        }
      }
    } else {
      // No QA pairs found - use AI agent
      logWithTimestamp('No relevant QA pairs found. Using AI agent for response.', 'info');

      try {
        // Pass client phone number to AI agent for enhanced property search with WhatsApp images
        const aiResponse = await generateAIResponse(message, language, from);
        response = aiResponse.response;
        responseSource = `AI Agent (confidence: ${(aiResponse.confidence * 100).toFixed(1)}%)`;

        // Log enhanced property search results
        if (aiResponse.source === 'enhanced_property_search' && aiResponse.propertySearchResult) {
          logWithTimestamp(
            `Enhanced property search completed: ${aiResponse.propertySearchResult.total} properties found`,
            'success'
          );
        }
      } catch (aiError: any) {
        logWithTimestamp(`AI Agent failed: ${aiError.message}. Using default response.`, 'error');
        response = getDefaultResponse(message, language);
        responseSource = 'Default Response';
      }
    }

    logWithTimestamp(`Response generated from: ${responseSource}`, 'info');

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