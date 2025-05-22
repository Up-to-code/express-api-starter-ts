/**
 * Interface for client data operations
 * 
 * This interface defines the contract for any repository that handles client data.
 * It allows for different implementations (Prisma, MongoDB, etc.) to be used
 * interchangeably.
 */
export interface IClientRepository {
  /**
   * Updates the last message for a client
   * 
   * @param phone - The client's phone number
   * @param message - The message content
   * @returns A promise that resolves when the update is complete
   * @throws {ClientUpdateError} If there's an error updating the client
   */
  updateLastMessage(phone: string, message: string): Promise<void>;
}
