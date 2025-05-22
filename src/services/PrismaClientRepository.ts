import { PrismaClient } from '@prisma/client';
import { IClientRepository } from '../interfaces/IClientRepository';
import { ClientNotFoundError, ClientUpdateError } from '../errors/AppError';

/**
 * Implementation of IClientRepository using Prisma ORM
 */
export class PrismaClientRepository implements IClientRepository {
  private prisma: PrismaClient;

  /**
   * Creates a new PrismaClientRepository
   * 
   * @param prisma - The Prisma client instance
   */
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Updates the last message for a client
   * 
   * @param phone - The client's phone number
   * @param message - The message content
   * @throws {ClientNotFoundError} If the client is not found
   * @throws {ClientUpdateError} If there's an error updating the client
   */
  async updateLastMessage(phone: string, message: string): Promise<void> {
    try {
      // Check if client exists
      const client = await this.prisma.client.findUnique({
        where: { phone },
        select: { id: true },
      });

      if (!client) {
        throw new ClientNotFoundError(phone);
      }

      // Update client's last message
      await this.prisma.client.update({
        where: { phone },
        data: {
          lastMessage: message,
          lastActive: new Date(),
        },
      });
    } catch (error: any) {
      if (error instanceof ClientNotFoundError) {
        throw error;
      } else {
        throw new ClientUpdateError(error.message || 'Unknown error');
      }
    }
  }
}
