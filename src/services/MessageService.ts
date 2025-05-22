import { IMessageSender } from '../interfaces/IMessageSender';
import { IClientRepository } from '../interfaces/IClientRepository';
import { AppError, ClientNotFoundError, MessageSendError } from '../errors/AppError';
import { logWithTimestamp } from '../utils/logger';

/**
 * Service for sending messages and updating client data
 */
export class MessageService {
  private messageSender: IMessageSender;
  private clientRepository: IClientRepository;

  /**
   * Creates a new MessageService
   * 
   * @param messageSender - The message sending service
   * @param clientRepository - The client data repository
   */
  constructor(
    messageSender: IMessageSender,
    clientRepository: IClientRepository
  ) {
    this.messageSender = messageSender;
    this.clientRepository = clientRepository;
  }

  /**
   * Sends a message and updates the client's last message
   * 
   * @param to - The recipient's phone number
   * @param text - The message content
   * @returns A result object with success status and optional error
   */
  async sendMessageAndUpdateClient(to: string, text: string): Promise<{
    success: boolean;
    error?: {
      message: string;
      code: string;
      statusCode: number;
    };
  }> {
    try {
      // Send the message
      const sent = await this.messageSender.sendMessage(to, text);
      
      if (!sent) {
        return {
          success: false,
          error: {
            message: 'Failed to send message',
            code: 'MESSAGE_SEND_FAILED',
            statusCode: 500,
          },
        };
      }
      
      // Update the client's last message
      await this.clientRepository.updateLastMessage(to, text);
      
      return { success: true };
    } catch (error: any) {
      // Log the error
      logWithTimestamp(`Error in MessageService: ${error.message}`, 'error');
      
      // Handle specific error types
      if (error instanceof ClientNotFoundError) {
        return {
          success: false,
          error: {
            message: error.message,
            code: 'CLIENT_NOT_FOUND',
            statusCode: 404,
          },
        };
      } else if (error instanceof MessageSendError) {
        return {
          success: false,
          error: {
            message: error.message,
            code: 'MESSAGE_SEND_FAILED',
            statusCode: 500,
          },
        };
      } else if (error instanceof AppError) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.constructor.name.replace('Error', '').toUpperCase(),
            statusCode: error.statusCode,
          },
        };
      } else {
        // Handle unknown errors
        return {
          success: false,
          error: {
            message: error.message || 'An unexpected error occurred',
            code: 'UNKNOWN_ERROR',
            statusCode: 500,
          },
        };
      }
    }
  }
}
