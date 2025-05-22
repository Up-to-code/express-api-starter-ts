import { IWhatsAppConfig } from '../interfaces/IWhatsAppConfig';
import { ConfigurationError } from '../errors/AppError';

/**
 * Implementation of IWhatsAppConfig that gets configuration from environment variables
 */
export class EnvWhatsAppConfig implements IWhatsAppConfig {
  /**
   * Gets the WhatsApp configuration from environment variables
   * 
   * @returns An object containing the phoneNumberId and accessToken
   * @throws {ConfigurationError} If any required configuration values are missing
   */
  async getConfig(): Promise<{ phoneNumberId: string; accessToken: string }> {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId) {
      throw new ConfigurationError('WHATSAPP_PHONE_NUMBER_ID is not defined in environment variables');
    }

    if (!accessToken) {
      throw new ConfigurationError('WHATSAPP_ACCESS_TOKEN is not defined in environment variables');
    }

    return { phoneNumberId, accessToken };
  }
}
