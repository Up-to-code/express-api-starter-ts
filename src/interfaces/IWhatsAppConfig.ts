/**
 * Interface for WhatsApp configuration
 * 
 * This interface defines the contract for any service that provides WhatsApp
 * configuration values. It allows for different sources of configuration
 * (environment variables, database, etc.) to be used interchangeably.
 */
export interface IWhatsAppConfig {
  /**
   * Gets the WhatsApp configuration values
   * 
   * @returns An object containing the phoneNumberId and accessToken
   * @throws {ConfigurationError} If any required configuration values are missing
   */
  getConfig(): Promise<{
    phoneNumberId: string;
    accessToken: string;
  }>;
}
