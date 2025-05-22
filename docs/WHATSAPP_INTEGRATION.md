# WhatsApp Business API Integration

This document provides detailed technical information about the WhatsApp Business API integration in this project.

## Table of Contents

1. [Overview](#overview)
2. [Setup Requirements](#setup-requirements)
3. [Webhook Architecture](#webhook-architecture)
4. [Message Processing Flow](#message-processing-flow)
5. [Template Messages](#template-messages)
6. [API Reference](#api-reference)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)

## Overview

This project integrates with the WhatsApp Business API to enable:

- Receiving messages from WhatsApp users
- Sending automated responses
- Sending template messages for marketing campaigns
- Tracking message delivery status

The integration uses the official WhatsApp Business API via Meta's Graph API.

## Setup Requirements

### Prerequisites

1. **Meta Developer Account**:
   - Register at [Meta for Developers](https://developers.facebook.com/)
   - Create a Meta App with WhatsApp API access

2. **WhatsApp Business Account**:
   - Connect your WhatsApp Business account to your Meta App
   - Set up a phone number for testing

3. **Webhook Configuration**:
   - Configure a webhook URL in the Meta Developer Portal
   - Set a verification token (must match `WHATSAPP_VERIFY_TOKEN` in your .env)
   - Subscribe to relevant webhook events (messages, message_status, etc.)

### Environment Variables

```
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_VERIFY_TOKEN=your_custom_verification_token
```

## Webhook Architecture

### Verification Endpoint

The verification endpoint (`GET /api/v1/webhook/whatsapp`) handles the initial webhook verification:

```typescript
// src/routes/Verification.ts
router.get('/', (req: Request<{}, {}, {}, WebhookQuery>, res: Response) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (validateWebhookVerification(mode ?? null, token ?? null, verifyToken)) {
      logWithTimestamp('Webhook verified successfully', 'info');
      return res.status(200).send(challenge);
    } else {
      logWithTimestamp('Webhook verification failed', 'error');
      return res.status(403).send('Verification failed');
    }
  } catch (error) {
    // Error handling...
  }
});
```

### Webhook Endpoint

The webhook endpoint (`POST /api/v1/webhook/whatsapp`) receives incoming messages:

```typescript
// src/routes/WebHook.ts
router.post('/', async (req: Request, res: Response) => {
  try {
    // Get webhook data
    const body: WhatsAppWebhook = req.body;

    // Validate webhook structure
    if (!isValidWebhookStructure(body)) {
      return res.status(400).json({ error: 'Invalid webhook data structure' });
    }

    const { value } = body.entry[0].changes[0];

    // Validate message data
    if (!isValidMessageData(value)) {
      return res.status(400).json({ error: 'Invalid or missing message data' });
    }

    // Process messages or status updates
    if (value.messages && Array.isArray(value.messages)) {
      for (const message of value.messages) {
        if (message.type === 'text' && message.text) {
          await processTextMessage(message, value);
        } else {
          // Handle non-text messages
        }
      }
    } else if (value.statuses && Array.isArray(value.statuses)) {
      // Process status updates
    }

    // Always return 200 OK to acknowledge receipt
    return res.status(200).json({ status: 'success' });
  } catch (error: any) {
    // Error handling...
  }
});
```

## Message Processing Flow

### 1. Receiving Messages

When a message is received via the webhook, it's first validated using:

- `isValidWebhookStructure`: Checks the overall webhook payload structure
- `isValidMessageData`: Validates the message data within the webhook

### 2. Processing Text Messages

Text messages are processed by the `processTextMessage` function:

```typescript
// src/functions/processTextMessage.ts
async function processTextMessage(message: WhatsAppMessage, value: any) {
  if (!message.text) return;

  const from = message.from;
  const text = message.text.body;
  const senderName = getSenderName(value, from);

  // Generate and send response
  const response = await generateResponse(text, from, senderName);
  const sent = await sendWhatsAppMessage(from, response);
}
```

### 3. Generating Responses

Responses are generated based on the message content:

```typescript
// src/functions/generateResponse.ts
async function generateResponse(message: string, from: string, senderName: string) {
  try {
    // Find or create client
    const client = await findOrCreateClient(from, senderName);

    // Save incoming message
    await saveMessage(message, client.id, false);
    await updateClientActivity(client.id, message);

    // Find relevant QA pairs
    const relevantQAs = await findRelevantQAPairs(message);

    // Determine language and generate response
    const language = detectLanguage(message);
    let response = '';

    if (relevantQAs.length > 0) {
      // Use the first matching QA
      response = relevantQAs[0].answer;
    } else {
      // Use default response
      response = getDefaultResponse(message, language);
    }

    // Save bot response
    await saveMessage(response, client.id, true);
    await updateClientActivity(client.id, response);

    return response;
  } catch (error: any) {
    // Error handling...
  }
}
```

### 4. Sending Messages

Messages are sent using the WhatsApp API:

```typescript
// src/functions/sendWhatsAppMessage.ts
async function sendWhatsAppMessage(to: string, text: string) {
  try {
    const { phoneNumberId, accessToken } = getWhatsAppConfig();
    await callWhatsAppAPI(phoneNumberId, accessToken, to, text);
    return true;
  } catch (error: any) {
    // Error handling...
    return false;
  }
}
```

The actual API call is made by:

```typescript
// src/functions/callWhatsAppAPI.ts
async function callWhatsAppAPI(phoneNumberId: string, accessToken: string, to: string, text: string) {
  const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        preview_url: false,
        body: text,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`WhatsApp API error: ${JSON.stringify(errorData)}`);
  }

  return response;
}
```

## Template Messages

WhatsApp template messages are pre-approved message formats that can be sent to users even outside the 24-hour messaging window.

### Sending Template Messages

Template messages are sent using the `sendWhatsAppTemplate` function:

```typescript
// src/services/sendWhatsAppTemplate.ts
export async function sendWhatsAppTemplate(
  recipientPhone: string,
  templateName: string,
  languageCode: string = 'en_US',
): Promise<any> {
  const url = 'https://graph.facebook.com/v22.0/415634904969622/messages';
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const data = {
    messaging_product: 'whatsapp',
    to: recipientPhone,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: languageCode,
      },
    },
  };

  try {
    const response: AxiosResponse = await axios.post(url, data, { headers });
    return response.data;
  } catch (error : any) {
    // Error handling...
    throw error;
  }
}
```

### Template Endpoints

The API provides endpoints for sending template messages:

```typescript
// src/routes/sendWhatsAppTemplate.ts
router.post('/', async (req: Request, res: Response) => {
  try {
    // Get request body
    const { phoneNumber, templateName, languageCode } = req.body;

    // Send WhatsApp template message
    const response = await sendWhatsAppTemplate(phoneNumber, templateName, languageCode);

    // Return response
    return res.status(200).json(response);
  } catch (error: any) {
    // Error handling...
  }
});
```

### Marketing Campaigns

The marketing module allows sending templates to multiple clients:

```typescript
// src/api/marketing/index.ts
router.post('/send_all', async (req, res) => {
  try {
    const { templateName, clientType, languageCode } = req.body;

    // Validate inputs...

    const clients = await prisma.client.findMany({
      where: { type: clientType },
    });

    // Send template to each client...

    return res.status(200).json({
      success: true,
      message: `Template ${templateName} broadcast to ${clientType}s`,
      sentCount: results.filter(r => r.status === 'success').length,
      failedCount: results.filter(r => r.status === 'failed').length,
      results,
    });
  } catch (error: any) {
    // Error handling...
  }
});
```

## API Reference

### WhatsApp Message Types

```typescript
// src/interfaces/WhatsAppMessageTypes.ts
export interface WhatsAppMessage {
  from: string
  id: string
  timestamp: string
  type: string
  text?: {
    body: string
  }
}

export interface WhatsAppContact {
  profile: {
    name: string
  }
  wa_id: string
}

export interface WhatsAppWebhook {
  object: string
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: string
        metadata: {
          display_phone_number: string
          phone_number_id: string
        }
        contacts?: WhatsAppContact[]
        messages?: WhatsAppMessage[]
        statuses?: any[]
      }
      field: string
    }>
  }>
}
```

### Webhook Query Parameters

```typescript
// src/interfaces/WebhookQuery.ts
export default interface WebhookQuery {
  "hub.mode"?: string;
  "hub.verify_token"?: string;
  "hub.challenge"?: string;
  [key: string]: string | undefined;
}
```

## Error Handling

The application implements comprehensive error handling for WhatsApp API interactions:

1. **Webhook Validation Errors**:
   - Invalid webhook structure returns 400 Bad Request
   - Invalid message data returns 400 Bad Request

2. **WhatsApp API Errors**:
   - Network errors are logged and reported
   - API response errors are parsed and logged

3. **Database Errors**:
   - Connection errors trigger retry logic
   - Query errors are logged and reported

## Best Practices

1. **Always Acknowledge Webhooks**:
   - Return 200 OK for all webhook requests, even if processing fails
   - Handle errors asynchronously after acknowledging receipt

2. **Rate Limiting**:
   - Be aware of WhatsApp API rate limits
   - Implement backoff strategies for bulk operations

3. **Template Management**:
   - Keep templates simple and focused
   - Test templates thoroughly before using in production
   - Maintain a catalog of approved templates

4. **Security**:
   - Never expose access tokens in client-side code
   - Validate all incoming webhook data
   - Use HTTPS for all API communications
