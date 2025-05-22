# Setup Guide

This guide will help you set up and run the Express API with WhatsApp integration.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database
- Git

You'll also need:

- A Meta Developer account
- A WhatsApp Business account
- A publicly accessible URL for webhook verification (use ngrok for local development)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd express-api-starter-ts
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# WhatsApp API Configuration
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_VERIFY_TOKEN=your_custom_verify_token
```

### 4. Set Up the Database

Create a PostgreSQL database:

```bash
createdb database_name
```

Run Prisma migrations:

```bash
npx prisma migrate dev --name init
```

This will create all the necessary tables in your database.

### 5. Start the Development Server

```bash
npm run dev
# or
yarn dev
```

The server will start on http://localhost:5000 (or the port you specified in the .env file).

## WhatsApp Business API Setup

### 1. Create a Meta Developer Account

1. Go to [Meta for Developers](https://developers.facebook.com/) and sign up
2. Create a new app by clicking "Create App"
3. Select "Business" as the app type
4. Fill in the required information and create the app

### 2. Set Up WhatsApp Business API

1. In your Meta Developer dashboard, navigate to "Add Products" and add "WhatsApp"
2. Follow the setup instructions to connect your WhatsApp Business account
3. Set up a test phone number for development

### 3. Configure Webhooks

1. In the WhatsApp settings, navigate to "Webhooks"
2. Set up a webhook URL (e.g., https://your-domain.com/api/v1/webhook/whatsapp)
3. Use the same verify token you set in your .env file
4. Subscribe to the following webhook fields:
   - messages
   - message_status

### 4. Set Up ngrok for Local Development

If you're developing locally, you'll need to expose your local server to the internet for webhook verification:

1. Install ngrok:
   ```bash
   npm install -g ngrok
   # or
   yarn global add ngrok
   ```

2. Start ngrok on the same port as your Express server:
   ```bash
   ngrok http 5000
   ```

3. Use the ngrok URL (e.g., https://abc123.ngrok.io) as your webhook URL in the Meta Developer dashboard

## Database Schema

The database schema is defined in `prisma/schema.prisma`. The main models are:

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

## Testing the API

### 1. Verify Webhook Setup

Test the webhook verification by sending a GET request to your webhook URL with the required parameters:

```
GET /api/v1/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=your_verify_token&hub.challenge=challenge_string
```

If set up correctly, you should receive the challenge string as a response.

### 2. Test Sending a Message

You can test sending a WhatsApp message using the following endpoint:

```
POST /api/v1/sendWhatsAppMessage
```

Request body:
```json
{
  "to": "recipient_phone_number",
  "text": "Hello, this is a test message!"
}
```

### 3. Test Sending a Template

Test sending a template message:

```
POST /api/v1/webhook/whatsapp/sendWhatsAppTemplate
```

Request body:
```json
{
  "phoneNumber": "recipient_phone_number",
  "templateName": "hello_world",
  "languageCode": "en_US"
}
```

## Troubleshooting

### Common Issues

1. **Webhook Verification Fails**:
   - Ensure your `WHATSAPP_VERIFY_TOKEN` matches the token in the Meta Developer dashboard
   - Check that your server is publicly accessible
   - Verify that the URL is correct and includes the full path

2. **Database Connection Issues**:
   - Check that your PostgreSQL server is running
   - Verify the `DATABASE_URL` in your .env file
   - Ensure the database exists and is accessible

3. **WhatsApp API Errors**:
   - Verify that your `WHATSAPP_ACCESS_TOKEN` is valid and not expired
   - Check that your `WHATSAPP_PHONE_NUMBER_ID` is correct
   - Ensure you're using the correct API version

### Logs

Check the server logs for detailed error messages. In development mode, the application logs detailed information about API requests, database queries, and errors.

## Architecture and Design Patterns

The application follows SOLID principles of object-oriented design to ensure maintainability, testability, and extensibility.

### SOLID Principles Implementation

#### Single Responsibility Principle (SRP)
Each class has a single responsibility:
- `WhatsAppMessageSender`: Responsible for sending WhatsApp messages
- `PrismaClientRepository`: Responsible for client data operations
- `EnvWhatsAppConfig`: Responsible for providing WhatsApp configuration
- `MessageService`: Coordinates the message sending and client update process

#### Open/Closed Principle (OCP)
The code is open for extension but closed for modification through interfaces:
- `IMessageSender`: Can be extended with new message sending implementations
- `IClientRepository`: Can be extended with new client data storage implementations
- `IWhatsAppConfig`: Can be extended with new configuration sources

#### Liskov Substitution Principle (LSP)
All implementations can be substituted for their interfaces without affecting behavior.

#### Interface Segregation Principle (ISP)
Interfaces are focused and specific:
- `IMessageSender`: Only concerned with sending messages
- `IClientRepository`: Only concerned with client data operations
- `IWhatsAppConfig`: Only concerned with providing configuration

#### Dependency Inversion Principle (DIP)
High-level modules depend on abstractions, not concrete implementations:
- `MessageService` depends on `IMessageSender` and `IClientRepository` interfaces
- Dependencies are injected through constructors

### Factory Pattern

The application uses the Factory pattern to create service instances:
- `MessageServiceFactory`: Creates `MessageService` instances with default or custom implementations

### Error Handling

The application uses custom error classes for better error handling:
- `AppError`: Base error class for application-specific errors
- `ConfigurationError`: For configuration-related errors
- `MessageSendError`: For message sending errors
- `ClientUpdateError`: For client update errors
- `ClientNotFoundError`: For when a client is not found
- `WhatsAppApiError`: For WhatsApp API errors

### API Response Format

API responses follow a consistent format:

Success response:
```json
{
  "success": true
}
```

Error response:
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

## Next Steps

After setting up the basic application, consider:

1. Adding authentication to secure the API
2. Implementing more sophisticated message processing logic
3. Setting up monitoring and logging for production
4. Creating a frontend interface for managing clients and messages
5. Implementing analytics to track message engagement
6. Adding unit and integration tests for the SOLID components
7. Implementing a caching layer for frequently accessed data
