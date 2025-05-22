/* eslint-disable import/no-extraneous-dependencies */
import axios, { AxiosResponse } from 'axios';

/**
 * Sends a WhatsApp template message using the WhatsApp Business API
 * @param recipientPhone - The recipient's phone number
 * @param templateName - The name of the template to send
 * @param languageCode - The language code for the template (default: en_US)
 * @param components - Optional template components for dynamic content
 * @returns Promise containing the API response data
 */
export async function sendWhatsAppTemplate(
  recipientPhone: string,
  templateName: string,
  languageCode: string = 'en_US',
  components?: any
): Promise<any> {
  const url = 'https://graph.facebook.com/v22.0/415634904969622/messages';
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // If templateName is 'custom_message', send a text message instead of a template
  if (templateName === 'custom_message' && components?.body?.message) {
    const data = {
      messaging_product: 'whatsapp',
      to: recipientPhone,
      type: 'text',
      text: {
        body: components.body.message
      }
    };

    try {
      const response = await axios.post(url, data, { headers });
      console.log('Success sending custom message:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending custom message:', error);
      throw error;
    }
  }

  // Otherwise, send a template message
  const data = {
    messaging_product: 'whatsapp',
    to: recipientPhone,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: languageCode,
      },
      ...(components && { components }),
    },
  };

  try {
    const response: AxiosResponse = await axios.post(url, data, { headers });
    console.log('Success:', response.data);
    return response.data;
  } catch (error : any) {
    if (axios.isAxiosError(error)) {
      console.error('Axios Error:', error.message);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error);
    }
    throw error; // Re-throw for caller handling
  }
}

// Example usage:
// async function main() {
//   try {
//     const result = await sendWhatsAppTemplate('201015638178', 'hello_world');
//     console.log('Template sent successfully:', result);
//   } catch (error) {
//     console.error('Failed to send template:', error);
//   }
// }
// main();