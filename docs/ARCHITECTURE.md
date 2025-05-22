# Architecture Documentation

This document provides detailed information about the architecture and design patterns used in the application.

## Table of Contents

1. [SOLID Principles](#solid-principles)
2. [Design Patterns](#design-patterns)
3. [Error Handling](#error-handling)
4. [Dependency Injection](#dependency-injection)
5. [API Response Format](#api-response-format)
6. [Testing Strategy](#testing-strategy)

## SOLID Principles

The application follows the SOLID principles of object-oriented design to ensure maintainability, testability, and extensibility.

### Single Responsibility Principle (SRP)

Each class has a single responsibility:

- **WhatsAppMessageSender**: Responsible for sending WhatsApp messages
  - Located in `src/services/WhatsAppMessageSender.ts`
  - Only handles the communication with the WhatsApp API

- **PrismaClientRepository**: Responsible for client data operations
  - Located in `src/services/PrismaClientRepository.ts`
  - Only handles database operations related to clients

- **EnvWhatsAppConfig**: Responsible for providing WhatsApp configuration
  - Located in `src/services/EnvWhatsAppConfig.ts`
  - Only handles retrieving and validating configuration values

- **MessageService**: Coordinates the message sending and client update process
  - Located in `src/services/MessageService.ts`
  - Orchestrates the workflow but delegates specific tasks to specialized services

### Open/Closed Principle (OCP)

The code is open for extension but closed for modification through interfaces:

- **IMessageSender**: Interface for message sending services
  - Located in `src/interfaces/IMessageSender.ts`
  - New message sending implementations can be added without modifying existing code

- **IClientRepository**: Interface for client data operations
  - Located in `src/interfaces/IClientRepository.ts`
  - New client data storage implementations can be added without modifying existing code

- **IWhatsAppConfig**: Interface for WhatsApp configuration
  - Located in `src/interfaces/IWhatsAppConfig.ts`
  - New configuration sources can be added without modifying existing code

### Liskov Substitution Principle (LSP)

All implementations can be substituted for their interfaces without affecting behavior:

- **WhatsAppMessageSender** implements **IMessageSender**
- **PrismaClientRepository** implements **IClientRepository**
- **EnvWhatsAppConfig** implements **IWhatsAppConfig**

This allows for easy swapping of implementations, such as:
- Replacing WhatsApp with another messaging platform
- Replacing Prisma with another ORM or database access method
- Replacing environment variables with another configuration source

### Interface Segregation Principle (ISP)

Interfaces are focused and specific:

- **IMessageSender**: Only concerned with sending messages
  - Has a single method: `sendMessage(to: string, text: string): Promise<boolean>`

- **IClientRepository**: Only concerned with client data operations
  - Has a single method: `updateLastMessage(phone: string, message: string): Promise<void>`

- **IWhatsAppConfig**: Only concerned with providing configuration
  - Has a single method: `getConfig(): Promise<{ phoneNumberId: string; accessToken: string }>`

### Dependency Inversion Principle (DIP)

High-level modules depend on abstractions, not concrete implementations:

- **MessageService** depends on **IMessageSender** and **IClientRepository** interfaces
  - Constructor: `constructor(messageSender: IMessageSender, clientRepository: IClientRepository)`
  - This allows for easy testing with mock implementations

- Dependencies are injected through constructors
  - This makes dependencies explicit and testable

## Design Patterns

### Factory Pattern

The application uses the Factory pattern to create service instances:

- **MessageServiceFactory**: Creates MessageService instances
  - Located in `src/factories/MessageServiceFactory.ts`
  - Provides methods for creating services with default or custom implementations:
    - `createDefault(prisma: PrismaClient): MessageService`
    - `createCustom(messageSender: IMessageSender, clientRepository: IClientRepository): MessageService`

### Repository Pattern

The application uses the Repository pattern for data access:

- **PrismaClientRepository**: Encapsulates the data access logic
  - Provides a clean API for client operations
  - Hides the details of the underlying data store

### Service Pattern

The application uses the Service pattern for business logic:

- **MessageService**: Encapsulates the business logic for sending messages
  - Coordinates the workflow
  - Handles error cases
  - Returns standardized responses

## Error Handling

The application uses custom error classes for better error handling:

- **AppError**: Base error class for application-specific errors
  - Located in `src/errors/AppError.ts`
  - Properties:
    - `message`: Error message
    - `statusCode`: HTTP status code
    - `isOperational`: Whether this is an operational error

- **ConfigurationError**: For configuration-related errors
  - Example: Missing WhatsApp API token

- **MessageSendError**: For message sending errors
  - Example: Network error when calling WhatsApp API

- **ClientUpdateError**: For client update errors
  - Example: Database error when updating client

- **ClientNotFoundError**: For when a client is not found
  - Example: Trying to update a non-existent client

- **WhatsAppApiError**: For WhatsApp API errors
  - Example: Invalid phone number format

## Dependency Injection

The application uses constructor injection for dependencies:

```typescript
// Example: MessageService constructor
constructor(
  messageSender: IMessageSender,
  clientRepository: IClientRepository
) {
  this.messageSender = messageSender;
  this.clientRepository = clientRepository;
}
```

This approach:
- Makes dependencies explicit
- Facilitates testing with mock implementations
- Follows the Dependency Inversion Principle

## API Response Format

API responses follow a consistent format:

### Success Response

```json
{
  "success": true
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Detailed error message",
    "code": "ERROR_CODE",
    "statusCode": 400
  }
}
```

## Testing Strategy

### Unit Testing

Unit tests should focus on testing individual components in isolation:

- **Services**: Test business logic with mocked dependencies
  - Example: Test MessageService with mock IMessageSender and IClientRepository

- **Repositories**: Test data access logic with a test database
  - Example: Test PrismaClientRepository with an in-memory database

- **Error Handling**: Test error cases and error propagation
  - Example: Test that MessageService properly handles errors from dependencies

### Integration Testing

Integration tests should focus on testing the interaction between components:

- **API Endpoints**: Test the complete request-response cycle
  - Example: Test the /api/v1/sendWhatsAppMessage endpoint

- **Database Operations**: Test the interaction with the actual database
  - Example: Test that client updates are persisted correctly

### End-to-End Testing

End-to-end tests should focus on testing the complete user flow:

- **User Scenarios**: Test complete user scenarios
  - Example: Test sending a message and verifying it appears in the client's message history
