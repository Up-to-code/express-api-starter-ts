# API Reference

This document provides detailed information about the API endpoints available in this application.

## Base URL

All API endpoints are prefixed with `/api/v1/`.

## Authentication

Currently, the API does not implement authentication. This should be added before deploying to production.

## Endpoints

### WhatsApp Webhook

#### Verify Webhook

```
GET /api/v1/webhook/whatsapp
```

Used by Meta to verify the webhook endpoint.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| hub.mode | string | Should be "subscribe" |
| hub.verify_token | string | The verification token set in your environment variables |
| hub.challenge | string | A challenge string that must be echoed back |

**Responses:**

| Status | Description |
|--------|-------------|
| 200 | Returns the challenge string if verification is successful |
| 403 | Verification failed |
| 500 | Server error |

#### Receive Webhook Events

```
POST /api/v1/webhook/whatsapp
```

Receives webhook events from WhatsApp Business API.

**Request Body:**

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "PHONE_NUMBER",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "contacts": [
              {
                "profile": {
                  "name": "CONTACT_NAME"
                },
                "wa_id": "WHATSAPP_ID"
              }
            ],
            "messages": [
              {
                "from": "SENDER_WHATSAPP_ID",
                "id": "MESSAGE_ID",
                "timestamp": "TIMESTAMP",
                "type": "text",
                "text": {
                  "body": "MESSAGE_BODY"
                }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

**Responses:**

| Status | Description |
|--------|-------------|
| 200 | Message received successfully |
| 400 | Invalid webhook data structure or message data |
| 500 | Server error |

### WhatsApp Templates

#### Send Template Message

```
POST /api/v1/webhook/whatsapp/sendWhatsAppTemplate
```

Sends a WhatsApp template message to a specified phone number.

**Request Body:**

```json
{
  "phoneNumber": "RECIPIENT_PHONE_NUMBER",
  "templateName": "TEMPLATE_NAME",
  "languageCode": "en_US"
}
```

**Responses:**

| Status | Description |
|--------|-------------|
| 200 | Template message sent successfully |
| 500 | Server error |

#### Test Template Message

```
GET /api/v1/webhook/whatsapp/sendWhatsAppTemplate
```

Test endpoint for sending a template message.

**Responses:**

| Status | Description |
|--------|-------------|
| 200 | Template message sent successfully |
| 500 | Server error |

### Marketing

#### Send Template to Specific Client

```
POST /api/v1/marketing/send/:clientId
```

Sends a template message to a specific client.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| clientId | string | ID of the client to send the template to |

**Request Body:**

```json
{
  "templateName": "TEMPLATE_NAME",
  "languageCode": "en_US"
}
```

**Responses:**

| Status | Description |
|--------|-------------|
| 200 | Template message sent successfully |
| 400 | Template name is required |
| 404 | Client not found |
| 500 | Server error |

#### Send Template to All Clients of a Type

```
POST /api/v1/marketing/send_all
```

Sends a template message to all clients of a specific type.

**Request Body:**

```json
{
  "templateName": "TEMPLATE_NAME",
  "clientType": "Client",
  "languageCode": "en_US"
}
```

**Responses:**

| Status | Description |
|--------|-------------|
| 200 | Template messages sent successfully |
| 400 | Template name or client type is required |
| 404 | No clients found with the specified type |
| 500 | Server error |

### Clients

#### Get All Clients

```
GET /api/v1/clients
```

Gets all clients with pagination.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Number of clients per page (default: 50) |

**Responses:**

| Status | Description |
|--------|-------------|
| 200 | Returns clients and pagination info |
| 500 | Server error |

#### Get Client by ID

```
GET /api/v1/clients/:id
```

Gets a specific client by ID.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | ID of the client to retrieve |

**Responses:**

| Status | Description |
|--------|-------------|
| 200 | Returns client data |
| 404 | Client not found |
| 500 | Server error |

#### Get Client Messages

```
GET /api/v1/clients/:id/messages
```

Gets all messages for a specific client.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | ID of the client |

**Responses:**

| Status | Description |
|--------|-------------|
| 200 | Returns client with messages |
| 404 | Client not found |
| 500 | Server error |

#### Create Client

```
POST /api/v1/clients
```

Creates a new client.

**Request Body:**

```json
{
  "name": "CLIENT_NAME",
  "phone": "PHONE_NUMBER",
  "type": "Client"
}
```

**Responses:**

| Status | Description |
|--------|-------------|
| 201 | Client created successfully |
| 400 | Invalid client data |
| 500 | Server error |

#### Update Client

```
PUT /api/v1/clients/:id
```

Updates an existing client.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | ID of the client to update |

**Request Body:**

```json
{
  "name": "UPDATED_NAME",
  "phone": "UPDATED_PHONE",
  "type": "UPDATED_TYPE"
}
```

**Responses:**

| Status | Description |
|--------|-------------|
| 200 | Client updated successfully |
| 404 | Client not found |
| 500 | Server error |

#### Delete Client

```
DELETE /api/v1/clients/:id
```

Deletes a client.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | ID of the client to delete |

**Responses:**

| Status | Description |
|--------|-------------|
| 200 | Client deleted successfully |
| 404 | Client not found |
| 500 | Server error |

### Messages

#### Send WhatsApp Message

```
POST /api/v1/sendWhatsAppMessage
```

Sends a WhatsApp message to a specified phone number and updates the client's last message.

**Request Body:**

```json
{
  "to": "RECIPIENT_PHONE_NUMBER",
  "text": "MESSAGE_TEXT"
}
```

**Success Response (200):**

```json
{
  "success": true
}
```

**Error Responses:**

| Status | Description | Example |
|--------|-------------|---------|
| 400 | Invalid parameters | `{"success":false,"error":{"message":"Missing or invalid recipient phone number","code":"INVALID_PARAMETER","statusCode":400}}` |
| 404 | Client not found | `{"success":false,"error":{"message":"Client not found with phone: 1234567890","code":"CLIENT_NOT_FOUND","statusCode":404}}` |
| 500 | Failed to send message | `{"success":false,"error":{"message":"Failed to send message: Network error","code":"MESSAGE_SEND_FAILED","statusCode":500}}` |
| 500 | Failed to update client | `{"success":false,"error":{"message":"Failed to update client: Database error","code":"CLIENT_UPDATE_FAILED","statusCode":500}}` |
