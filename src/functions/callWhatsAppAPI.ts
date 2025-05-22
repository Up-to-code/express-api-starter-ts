/**
 * Makes a direct API call to the WhatsApp Business API to send a text message
 *
 * This function constructs and sends the API request to the WhatsApp Business API
 * using the Graph API. It handles the request formatting and error handling.
 *
 * @param {string} phoneNumberId - The WhatsApp Business phone number ID
 * @param {string} accessToken - The WhatsApp Business API access token
 * @param {string} to - The recipient's phone number in international format
 * @param {string} text - The text message to send
 * @returns {Promise<Response>} A promise that resolves to the API response
 *
 * @throws {Error} If the API request fails, with details about the error
 *
 * @example
 * try {
 *   const response = await callWhatsAppAPI(
 *     process.env.WHATSAPP_PHONE_NUMBER_ID,
 *     process.env.WHATSAPP_ACCESS_TOKEN,
 *     '+1234567890',
 *     'Hello, world!'
 *   );
 *   console.log('Message sent successfully');
 * } catch (error) {
 *   console.error('Failed to send message:', error.message);
 * }
 */
async function callWhatsAppAPI(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  text: string
): Promise<Response> {
  // Construct the API URL with the phone number ID
  const apiUrl = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;

  // Make the API request
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        preview_url: false,
        body: text,
      },
    }),
  });

  // Handle API errors
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`WhatsApp API error: ${JSON.stringify(errorData)}`);
  }

  return response;
}

export { callWhatsAppAPI };