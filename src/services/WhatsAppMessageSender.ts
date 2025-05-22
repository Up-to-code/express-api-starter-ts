import { IMessageSender } from '../interfaces/IMessageSender';
import { IWhatsAppConfig } from '../interfaces/IWhatsAppConfig';
import { MessageSendError, WhatsAppApiError } from '../errors/AppError';
import { logWithTimestamp } from '../utils/logger';

/**
 * Implementation of IMessageSender for WhatsApp
 */
export class WhatsAppMessageSender implements IMessageSender {
  private config: IWhatsAppConfig;

  /**
   * Creates a new WhatsAppMessageSender
   * 
   * @param config - The WhatsApp configuration provider
   */
  constructor(config: IWhatsAppConfig) {
    this.config = config;
  }

  /**
   * Sends a WhatsApp message
   * 
   * @param to - The recipient's phone number
   * @param text - The message content
   * @returns A promise that resolves to true if the message was sent successfully
   * @throws {MessageSendError} If there's an error sending the message
   */
  async sendMessage(to: string, text: string): Promise<boolean> {
    try {
      // Get configuration
      const { phoneNumberId, accessToken } = await this.config.getConfig();
      
      // Call WhatsApp API
      await this.callWhatsAppAPI(phoneNumberId, accessToken, to, text);
      
      // Log success
      logWithTimestamp(`Message sent successfully to ${to}`, 'success');
      
      return true;
    } catch (error: any) {
      // Log error
      logWithTimestamp(`Failed to send WhatsApp message: ${error.message}`, 'error');
      
      // Rethrow as MessageSendError
      if (error instanceof WhatsAppApiError) {
        throw new MessageSendError(error.message);
      } else {
        throw new MessageSendError(error.message || 'Unknown error');
      }
    }
  }

  /**
   * Makes a direct API call to the WhatsApp Business API
   * 
   * @param phoneNumberId - The WhatsApp Business phone number ID
   * @param accessToken - The WhatsApp Business API access token
   * @param to - The recipient's phone number
   * @param text - The message content
   * @throws {WhatsAppApiError} If the API request fails
   */
  private async callWhatsAppAPI(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    text: string
  ): Promise<void> {
    // Construct the API URL
    const apiUrl = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
    
    try {
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
        throw new WhatsAppApiError(JSON.stringify(errorData));
      }
    } catch (error: any) {
      if (error instanceof WhatsAppApiError) {
        throw error;
      } else {
        throw new WhatsAppApiError(error.message || 'Unknown error');
      }
    }
  }
}
