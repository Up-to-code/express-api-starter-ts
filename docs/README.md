# Express API Starter with TypeScript - WhatsApp Integration

This documentation provides a comprehensive overview of the Express API Starter with TypeScript project, which has been extended with WhatsApp Business API integration.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Project Structure](#project-structure)
4. [API Endpoints](#api-endpoints)
5. [WhatsApp Integration](#whatsapp-integration)
6. [Database](#database)
7. [Architecture](#architecture)
8. [Environment Variables](#environment-variables)
9. [Development](#development)
10. [Testing](#testing)
11. [Deployment](#deployment)

## Project Overview

This project is a RESTful API built with Express.js and TypeScript, featuring WhatsApp Business API integration for messaging and notifications. It includes a PostgreSQL database with Prisma ORM for data management.

### Key Features

- WhatsApp webhook integration for receiving messages
- Automated responses to WhatsApp messages
- Template message support for marketing campaigns
- Client management system
- Message history tracking
- Multi-language support

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- WhatsApp Business API account
- Meta Developer account

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd express-api-starter-ts
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
   WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
   WHATSAPP_VERIFY_TOKEN=your_custom_verify_token
   ```

4. Initialize the database:
   ```
   npx prisma migrate dev --name init
   ```

5. Start the development server:
   ```
   npm run dev
   ```

## Project Structure

```
express-api-starter-ts/
├── src/
│   ├── api/                  # API route handlers organized by feature
│   │   ├── Client/           # Client-related endpoints
│   │   ├── marketing/        # Marketing campaign endpoints
│   │   ├── Massage/          # Message-related endpoints
│   │   └── webhook/          # WhatsApp webhook endpoints
│   ├── errors/               # Custom error classes
│   │   └── AppError.ts       # Base error class and specific error types
│   ├── factories/            # Factory classes for creating service instances
│   │   └── MessageServiceFactory.ts # Factory for message-related services
│   ├── functions/            # Business logic functions
│   ├── interfaces/           # TypeScript interfaces
│   │   ├── IClientRepository.ts # Interface for client data operations
│   │   ├── IMessageSender.ts    # Interface for message sending services
│   │   ├── IWhatsAppConfig.ts   # Interface for WhatsApp configuration
│   │   └── WhatsAppMessageTypes.ts # WhatsApp message type definitions
│   ├── lib/                  # Library code (Prisma client, etc.)
│   ├── middlewares/          # Express middlewares
│   ├── routes/               # Route definitions
│   ├── services/             # Service implementations
│   │   ├── EnvWhatsAppConfig.ts     # WhatsApp config from env vars
│   │   ├── MessageService.ts        # Message sending service
│   │   ├── PrismaClientRepository.ts # Client repository using Prisma
│   │   └── WhatsAppMessageSender.ts  # WhatsApp message sender
│   ├── utils/                # Utility functions
│   ├── app.ts                # Express app configuration
│   └── index.ts              # Application entry point
├── prisma/                   # Prisma ORM configuration
│   └── schema.prisma         # Database schema
├── docs/                     # Documentation
│   ├── API_REFERENCE.md      # API endpoint documentation
│   ├── ARCHITECTURE.md       # Architecture and design patterns
│   ├── README.md             # Main documentation
│   ├── SETUP_GUIDE.md        # Setup instructions
│   └── WHATSAPP_INTEGRATION.md # WhatsApp integration details
├── test/                     # Test files
└── package.json              # Project dependencies and scripts
```

## API Endpoints

### WhatsApp Webhook

- `GET /api/v1/webhook/whatsapp` - Webhook verification endpoint
- `POST /api/v1/webhook/whatsapp` - Webhook for receiving WhatsApp messages

### WhatsApp Templates

- `GET /api/v1/webhook/whatsapp/sendWhatsAppTemplate` - Test template sending
- `POST /api/v1/webhook/whatsapp/sendWhatsAppTemplate` - Send a template message

### Marketing

- `POST /api/v1/marketing/send/:clientId` - Send template to a specific client
- `POST /api/v1/marketing/send_all` - Send template to all clients of a specific type

### Clients

- `GET /api/v1/clients` - Get all clients with pagination
- `GET /api/v1/clients/:id` - Get a specific client
- `GET /api/v1/clients/:id/messages` - Get messages for a specific client
- `POST /api/v1/clients` - Create a new client
- `PUT /api/v1/clients/:id` - Update a client
- `DELETE /api/v1/clients/:id` - Delete a client

### Messages

- `POST /api/v1/sendWhatsAppMessage` - Send a WhatsApp message

## WhatsApp Integration

### Webhook Setup

The WhatsApp webhook integration consists of two main components:

1. **Verification Endpoint** (`GET /api/v1/webhook/whatsapp`):
   - Verifies the webhook with WhatsApp Business API
   - Responds to the challenge request from Meta

2. **Webhook Endpoint** (`POST /api/v1/webhook/whatsapp`):
   - Receives incoming messages and status updates
   - Validates the webhook data structure
   - Processes text messages and generates responses
   - Acknowledges receipt to WhatsApp

### Message Processing Flow

1. Webhook receives a message
2. Message structure is validated
3. For text messages:
   - Client is found or created in the database
   - Message is saved to the database
   - Response is generated (using QA pairs or default responses)
   - Response is sent back to the user
   - Response is saved to the database

### Template Messages

The system supports sending WhatsApp template messages for marketing campaigns:

- Templates must be pre-approved in the WhatsApp Business Manager
- Templates can be sent to individual clients or groups of clients
- Language localization is supported

## Database

The project uses PostgreSQL with Prisma ORM. The main models include:

### Client

Represents a WhatsApp user who has interacted with the system.

```prisma
model Client {
  id          String     @id @default(cuid())
  name        String
  phone       String     @unique
  lastActive  DateTime   @default(now())
  lastMessage String
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  messages    Message[]
  type        String     @default("Client")
  campaigns   Campaign[] @relation("CampaignToClient")
}
```

### Message

Stores all messages exchanged with clients.

```prisma
model Message {
  id        String   @id @default(cuid())
  text      String
  clientId  String
  isBot     Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  client    Client   @relation(fields: [clientId], references: [id])
}
```

### QAPair

Stores question-answer pairs for automated responses.

```prisma
model QAPair {
  id       String @id @default(cuid())
  question String
  answer   String
  category String
}
```

## Architecture

The application follows SOLID principles of object-oriented design to ensure maintainability, testability, and extensibility.

### SOLID Principles

- **Single Responsibility Principle (SRP)**: Each class has a single responsibility
- **Open/Closed Principle (OCP)**: Code is open for extension but closed for modification
- **Liskov Substitution Principle (LSP)**: Implementations can be substituted for their interfaces
- **Interface Segregation Principle (ISP)**: Interfaces are focused and specific
- **Dependency Inversion Principle (DIP)**: High-level modules depend on abstractions

### Key Components

- **Interfaces**: Define contracts for services (`IMessageSender`, `IClientRepository`, etc.)
- **Services**: Implement business logic (`WhatsAppMessageSender`, `MessageService`, etc.)
- **Repositories**: Handle data access (`PrismaClientRepository`)
- **Factories**: Create service instances (`MessageServiceFactory`)
- **Error Handling**: Custom error classes for better error handling

For detailed information about the architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Environment Variables

The following environment variables are required:

| Variable | Description |
|----------|-------------|
| `PORT` | Port for the Express server (default: 5000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Business API phone number ID |
| `WHATSAPP_ACCESS_TOKEN` | WhatsApp Business API access token |
| `WHATSAPP_VERIFY_TOKEN` | Custom verification token for webhook setup |

## Development

### Running the Development Server

```bash
npm run dev
```

This starts the server with nodemon, which automatically restarts when files change.

### Building for Production

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist` directory.

### Running in Production

```bash
npm run start:dist
```

## Code Structure Details

### WhatsApp Message Processing

The WhatsApp message processing flow is handled by several components:

1. **WebHook.ts**: Receives and validates incoming webhook data
2. **processTextMessage.ts**: Processes text messages and generates responses
3. **generateResponse.ts**: Generates appropriate responses based on message content
4. **MessageService**: Coordinates sending messages and updating client data
5. **WhatsAppMessageSender**: Handles the actual sending of messages to WhatsApp API

### Service Architecture

The application uses a service-oriented architecture with dependency injection:

1. **Interfaces**:
   - **IMessageSender**: Interface for message sending services
   - **IClientRepository**: Interface for client data operations
   - **IWhatsAppConfig**: Interface for WhatsApp configuration

2. **Service Implementations**:
   - **WhatsAppMessageSender**: Implements IMessageSender for WhatsApp
   - **PrismaClientRepository**: Implements IClientRepository using Prisma
   - **EnvWhatsAppConfig**: Implements IWhatsAppConfig using environment variables

3. **Factory**:
   - **MessageServiceFactory**: Creates service instances with proper dependencies

### Error Handling

The application uses custom error classes for better error handling:

- **AppError**: Base error class for application-specific errors
- **ConfigurationError**: For configuration-related errors
- **MessageSendError**: For message sending errors
- **ClientUpdateError**: For client update errors
- **ClientNotFoundError**: For when a client is not found
- **WhatsAppApiError**: For WhatsApp API errors

### Utility Functions

The project includes several utility functions:

- **logger.ts**: Logging with timestamps and log levels
- **helpers.ts**: Various helper functions for text processing and validation
- **isValidMessageData.ts**: Validates WhatsApp message data structure

### Database Operations

Database operations are handled through the PrismaClientRepository:

- **PrismaClientRepository**: Encapsulates client data operations
- **prisma.ts**: Configures and exports the Prisma client with connection retry logic
- **saveMessage.ts**: Saves messages to the database
- **findOrCreateClient.ts**: Finds or creates a client record

## Testing

Run tests with:

```bash
npm test
```

The project uses Jest for testing. Test files are located in the `test` directory.

## Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Set up environment variables on your production server

3. Start the application:
   ```bash
   npm run start:dist
   ```

## Troubleshooting

### Common Issues

1. **Webhook Verification Fails**:
   - Ensure `WHATSAPP_VERIFY_TOKEN` matches the token configured in Meta Developer Portal
   - Check that your server is publicly accessible

2. **Database Connection Issues**:
   - Verify `DATABASE_URL` is correct
   - Ensure PostgreSQL server is running
   - Check network connectivity

3. **WhatsApp API Errors**:
   - Verify `WHATSAPP_ACCESS_TOKEN` is valid and not expired
   - Check rate limits in Meta Developer Portal
   - Ensure templates are approved before sending
