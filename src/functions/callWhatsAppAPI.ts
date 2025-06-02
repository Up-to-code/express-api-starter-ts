/**
 * WhatsApp API response interface
 */
interface WhatsAppAPIResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

/**
 * Makes a direct API call to the WhatsApp Business API to send a text message
 *
 * This function constructs and sends the API request to the WhatsApp Business API
 * using the Graph API. It handles the request formatting and error handling.
 * Now returns the message ID for tracking purposes.
 *
 * @param {string} phoneNumberId - The WhatsApp Business phone number ID
 * @param {string} accessToken - The WhatsApp Business API access token
 * @param {string} to - The recipient's phone number in international format
 * @param {string} text - The text message to send
 * @param {boolean} trackReadReceipts - Whether to request read receipts (default: true)
 * @returns {Promise<{response: Response, messageId: string}>} A promise that resolves to the API response and message ID
 *
 * @throws {Error} If the API request fails, with details about the error
 *
 * @example
 * try {
 *   const { response, messageId } = await callWhatsAppAPI(
 *     process.env.WHATSAPP_PHONE_NUMBER_ID,
 *     process.env.WHATSAPP_ACCESS_TOKEN,
 *     '+1234567890',
 *     'Hello, world!',
 *     true
 *   );
 *   console.log('Message sent successfully with ID:', messageId);
 * } catch (error) {
 *   console.error('Failed to send message:', error.message);
 * }
 */
async function callWhatsAppAPI(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  text: string,
  trackReadReceipts: boolean = true
): Promise<{response: Response, messageId: string}> {
  // Construct the API URL with the phone number ID
  const apiUrl = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;

  // Prepare the message payload
  const messagePayload: any = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: {
      preview_url: false,
      body: text,
    },
  };

  // Add read receipt tracking if enabled
  if (trackReadReceipts) {
    messagePayload.status = 'read'; // Request read receipts
  }

  // Make the API request
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(messagePayload),
  });

  // Handle API errors
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`WhatsApp API error: ${JSON.stringify(errorData)}`);
  }

  // Parse response to get message ID
  const responseData: WhatsAppAPIResponse = await response.json();
  const messageId = responseData.messages?.[0]?.id || '';

  if (!messageId) {
    throw new Error('No message ID returned from WhatsApp API');
  }

  return { response, messageId };
}

export { callWhatsAppAPI };