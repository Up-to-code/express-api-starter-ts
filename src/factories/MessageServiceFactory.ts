import { PrismaClient } from '@prisma/client';
import { MessageService } from '../services/MessageService';
import { WhatsAppMessageSender } from '../services/WhatsAppMessageSender';
import { PrismaClientRepository } from '../services/PrismaClientRepository';
import { EnvWhatsAppConfig } from '../services/EnvWhatsAppConfig';
import { IMessageSender } from '../interfaces/IMessageSender';
import { IClientRepository } from '../interfaces/IClientRepository';
import { IWhatsAppConfig } from '../interfaces/IWhatsAppConfig';

/**
 * Factory for creating MessageService instances
 * 
 * This factory makes it easy to create MessageService instances with
 * the default implementations or custom implementations.
 */
export class MessageServiceFactory {
  /**
   * Creates a MessageService with the default implementations
   * 
   * @param prisma - The Prisma client instance
   * @returns A MessageService instance
   */
  static createDefault(prisma: PrismaClient): MessageService {
    const whatsAppConfig = new EnvWhatsAppConfig();
    const messageSender = new WhatsAppMessageSender(whatsAppConfig);
    const clientRepository = new PrismaClientRepository(prisma);
    
    return new MessageService(messageSender, clientRepository);
  }
  
  /**
   * Creates a MessageService with custom implementations
   * 
   * @param messageSender - The message sending service
   * @param clientRepository - The client data repository
   * @returns A MessageService instance
   */
  static createCustom(
    messageSender: IMessageSender,
    clientRepository: IClientRepository
  ): MessageService {
    return new MessageService(messageSender, clientRepository);
  }
  
  /**
   * Creates a WhatsAppMessageSender with the default configuration
   * 
   * @returns A WhatsAppMessageSender instance
   */
  static createWhatsAppMessageSender(): WhatsAppMessageSender {
    const whatsAppConfig = new EnvWhatsAppConfig();
    return new WhatsAppMessageSender(whatsAppConfig);
  }
  
  /**
   * Creates a WhatsAppMessageSender with a custom configuration
   * 
   * @param config - The WhatsApp configuration provider
   * @returns A WhatsAppMessageSender instance
   */
  static createWhatsAppMessageSenderWithConfig(
    config: IWhatsAppConfig
  ): WhatsAppMessageSender {
    return new WhatsAppMessageSender(config);
  }
  
  /**
   * Creates a PrismaClientRepository
   * 
   * @param prisma - The Prisma client instance
   * @returns A PrismaClientRepository instance
   */
  static createPrismaClientRepository(
    prisma: PrismaClient
  ): PrismaClientRepository {
    return new PrismaClientRepository(prisma);
  }
}
