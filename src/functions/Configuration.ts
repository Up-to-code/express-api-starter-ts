/* eslint-disable @typescript-eslint/quotes */

/**
 * Interface for WhatsApp configuration
 * @interface WhatsAppConfig
 */
export interface WhatsAppConfig {
  /** The WhatsApp Business phone number ID */
  phoneNumberId: string;
  /** The WhatsApp Business API access token */
  accessToken: string;
}

/**
 * Retrieves the WhatsApp configuration from environment variables
 *
 * This function gets the WhatsApp Business API configuration values from
 * environment variables and validates that they are present.
 *
 * @returns {WhatsAppConfig} An object containing the phoneNumberId and accessToken
 * @throws {Error} If any required configuration values are missing
 *
 * @example
 * try {
 *   const { phoneNumberId, accessToken } = getWhatsAppConfig();
 *   // Use the configuration values
 * } catch (error) {
 *   console.error('Configuration error:', error.message);
 * }
 */
export function getWhatsAppConfig(): WhatsAppConfig {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error("Missing WhatsApp configuration");
  }

  return { phoneNumberId, accessToken };
}
