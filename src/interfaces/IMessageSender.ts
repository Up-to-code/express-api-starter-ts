/**
 * Interface for message sending services
 * 
 * This interface defines the contract for any service that can send messages.
 * It allows for different implementations (WhatsApp, SMS, email, etc.) to be
 * used interchangeably.
 */
export interface IMessageSender {
  /**
   * Sends a message to a recipient
   * 
   * @param to - The recipient's identifier (phone number, email, etc.)
   * @param text - The message content
   * @returns A promise that resolves to a boolean indicating success or failure
   * @throws {MessageSendError} If there's an error sending the message
   */
  sendMessage(to: string, text: string): Promise<boolean>;
}
