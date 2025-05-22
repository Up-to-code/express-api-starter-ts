# API Reference for Front-End Developers

This document provides comprehensive information about all available API endpoints in the Express API with WhatsApp integration. It is specifically designed for front-end developers who need to interact with the backend services.

## Table of Contents

1. [Base URL](#base-url)
2. [Authentication](#authentication)
3. [Response Format](#response-format)
4. [Dashboard](#dashboard)
5. [Client Management](#client-management)
6. [Message Management](#message-management)
7. [WhatsApp Templates](#whatsapp-templates)
8. [Marketing Campaigns](#marketing-campaigns)
9. [Error Handling](#error-handling)

## Base URL

All API endpoints are prefixed with:

```
/api/v1
```

For local development, the complete base URL would be:

```
http://localhost:5000/api/v1
```

## Authentication

Currently, the API does not implement authentication. This should be added before deploying to production.

## Response Format

Most API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": { ... }  // Optional, depends on the endpoint
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

## Dashboard

### Get Dashboard Overview

```
GET /
```

Returns basic statistics about the system.

**Response Example:**

```json
{
  "totalClients": 125,
  "totalMessages": 1543,
  "activeCampaigns": 3,
  "timestamp": "2023-06-15T14:30:45.123Z"
}
```

**Status Codes:**
- `200 OK`: Request successful
- `500 Internal Server Error`: Server error

### Get Dashboard Statistics

```
GET /stats
```

Returns detailed statistics about the system.

**Response Example:**

```json
{
  "totalClients": 125,
  "totalMessages": 1543,
  "activeClients": 78,
  "activeCampaigns": 3
}
```

**Status Codes:**
- `200 OK`: Request successful
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Database connection error

### Get Recent Activity

```
GET /recent-activity
```

Returns recent messages and clients.

**Response Example:**

```json
{
  "recentMessages": [
    {
      "id": "msg123",
      "text": "Hello, how can I help you?",
      "createdAt": "2023-06-15T14:30:45.123Z",
      "client": {
        "id": "client456",
        "name": "John Doe",
        "phone": "+1234567890"
      }
    }
  ],
  "recentClients": [
    {
      "id": "client789",
      "name": "Jane Smith",
      "phone": "+9876543210",
      "createdAt": "2023-06-14T10:20:30.456Z"
    }
  ],
  "dataStatus": "complete"
}
```

**Status Codes:**
- `200 OK`: Request successful
- `500 Internal Server Error`: Server error

### Get Campaign Performance

```
GET /campaign-performance
```

Returns performance data for campaigns.

**Response Example:**

```json
[
  {
    "id": "campaign123",
    "name": "Summer Sale",
    "status": "Active",
    "sentCount": 250,
    "lastSentAt": "2023-06-15T14:30:45.123Z",
    "_count": {
      "clients": 300
    }
  }
]
```

**Status Codes:**
- `200 OK`: Request successful
- `500 Internal Server Error`: Server error

## Client Management

### Get All Clients

```
GET /clients
```

Returns a paginated list of clients.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Number of clients per page (default: 50) |

**Response Example:**

```json
{
  "data": [
    {
      "id": "client123",
      "name": "John Doe",
      "phone": "+1234567890",
      "lastActive": "2023-06-15T14:30:45.123Z",
      "lastMessage": "Hello, how can I help you?",
      "createdAt": "2023-06-01T10:20:30.456Z",
      "updatedAt": "2023-06-15T14:30:45.123Z",
      "type": "Client"
    }
  ],
  "pagination": {
    "total": 125,
    "page": 1,
    "limit": 50,
    "totalPages": 3,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

**Status Codes:**
- `200 OK`: Request successful
- `500 Internal Server Error`: Server error

### Get Client by ID

```
GET /clients/:id
```

Returns a specific client by ID.

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Client ID |

**Response Example:**

```json
{
  "id": "client123",
  "name": "John Doe",
  "phone": "+1234567890",
  "lastActive": "2023-06-15T14:30:45.123Z",
  "lastMessage": "Hello, how can I help you?",
  "createdAt": "2023-06-01T10:20:30.456Z",
  "updatedAt": "2023-06-15T14:30:45.123Z",
  "type": "Client",
  "messages": [
    {
      "id": "msg456",
      "text": "Hello, how can I help you?",
      "clientId": "client123",
      "isBot": true,
      "createdAt": "2023-06-15T14:30:45.123Z",
      "updatedAt": "2023-06-15T14:30:45.123Z"
    }
  ]
}
```

**Status Codes:**
- `200 OK`: Request successful
- `404 Not Found`: Client not found
- `500 Internal Server Error`: Server error

### Get Client Messages

```
GET /clients/:id/messages
```

Returns all messages for a specific client.

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Client ID |

**Response Example:**

```json
{
  "id": "client123",
  "name": "John Doe",
  "phone": "+1234567890",
  "lastActive": "2023-06-15T14:30:45.123Z",
  "lastMessage": "Hello, how can I help you?",
  "createdAt": "2023-06-01T10:20:30.456Z",
  "updatedAt": "2023-06-15T14:30:45.123Z",
  "type": "Client",
  "messages": [
    {
      "id": "msg456",
      "text": "Hello, how can I help you?",
      "clientId": "client123",
      "isBot": true,
      "createdAt": "2023-06-15T14:30:45.123Z",
      "updatedAt": "2023-06-15T14:30:45.123Z"
    }
  ]
}
```

**Status Codes:**
- `200 OK`: Request successful
- `404 Not Found`: Client not found
- `500 Internal Server Error`: Server error

### Create Client

```
POST /clients
```

Creates a new client.

**Request Headers:**

| Header | Value |
|--------|-------|
| Content-Type | application/json |

**Request Body:**

```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "type": "Client"
}
```

**Response Example:**

```json
{
  "id": "client123",
  "name": "John Doe",
  "phone": "+1234567890",
  "lastActive": "2023-06-15T14:30:45.123Z",
  "lastMessage": "",
  "createdAt": "2023-06-15T14:30:45.123Z",
  "updatedAt": "2023-06-15T14:30:45.123Z",
  "type": "Client"
}
```

**Status Codes:**
- `201 Created`: Client created successfully
- `400 Bad Request`: Invalid client data
- `500 Internal Server Error`: Server error

### Update Client

```
PUT /clients/:id
```

Updates an existing client.

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Client ID |

**Request Headers:**

| Header | Value |
|--------|-------|
| Content-Type | application/json |

**Request Body:**

```json
{
  "name": "John Smith",
  "phone": "+1234567890",
  "type": "Broker"
}
```

**Response Example:**

```json
{
  "id": "client123",
  "name": "John Smith",
  "phone": "+1234567890",
  "lastActive": "2023-06-15T14:30:45.123Z",
  "lastMessage": "Hello, how can I help you?",
  "createdAt": "2023-06-01T10:20:30.456Z",
  "updatedAt": "2023-06-15T14:35:50.789Z",
  "type": "Broker"
}
```

**Status Codes:**
- `200 OK`: Client updated successfully
- `404 Not Found`: Client not found
- `500 Internal Server Error`: Server error

### Delete Client

```
DELETE /clients/:id
```

Deletes a client.

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Client ID |

**Status Codes:**
- `204 No Content`: Client deleted successfully
- `404 Not Found`: Client not found
- `500 Internal Server Error`: Server error

## Message Management

### Send WhatsApp Message

```
POST /sendWhatsAppMessage
```

Sends a WhatsApp message to a specified phone number and updates the client's last message.

**Request Headers:**

| Header | Value |
|--------|-------|
| Content-Type | application/json |

**Request Body:**

```json
{
  "to": "1234567890",
  "text": "Hello, this is a test message!"
}
```

**Response Example (Success):**

```json
{
  "success": true
}
```

**Response Example (Error):**

```json
{
  "success": false,
  "error": {
    "message": "Client not found with phone: 1234567890",
    "code": "CLIENT_NOT_FOUND",
    "statusCode": 404
  }
}
```

**Status Codes:**
- `200 OK`: Message sent successfully
- `400 Bad Request`: Missing or invalid parameters
- `404 Not Found`: Client not found
- `500 Internal Server Error`: Failed to send message or update client

## WhatsApp Templates

### Send Template Message

```
POST /webhook/whatsapp/sendWhatsAppTemplate
```

Sends a template message to a specified phone number.

**Request Headers:**

| Header | Value |
|--------|-------|
| Content-Type | application/json |

**Request Body:**

```json
{
  "phoneNumber": "1234567890",
  "templateName": "hello_world",
  "languageCode": "en_US"
}
```

**Response Example:**

```json
{
  "messaging_product": "whatsapp",
  "contacts": [
    {
      "input": "1234567890",
      "wa_id": "1234567890"
    }
  ],
  "messages": [
    {
      "id": "wamid.HBgMMTIzNDU2Nzg5MFQIAERgSNjVBRDk3QkI5QTI3QTg5RjA5AA=="
    }
  ]
}
```

**Status Codes:**
- `200 OK`: Template message sent successfully
- `500 Internal Server Error`: Failed to send template message

### Test Template Message

```
GET /webhook/whatsapp/sendWhatsAppTemplate
```

Test endpoint for sending a predefined template message to a test phone number.

**Response Example:**

```json
{
  "messaging_product": "whatsapp",
  "contacts": [
    {
      "input": "201015638178",
      "wa_id": "201015638178"
    }
  ],
  "messages": [
    {
      "id": "wamid.HBgMMjAxMDE1NjM4MTc4FQIAERgSNjVBRDk3QkI5QTI3QTg5RjA5AA=="
    }
  ]
}
```

**Status Codes:**
- `200 OK`: Template message sent successfully
- `500 Internal Server Error`: Failed to send template message

## Marketing Campaigns

### Send Template to Specific Client

```
POST /marketing/send/:clientId
```

Sends a template message to a specific client.

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| clientId | string | Yes | ID of the client to send the template to |

**Request Headers:**

| Header | Value |
|--------|-------|
| Content-Type | application/json |

**Request Body:**

```json
{
  "templateName": "hello_world",
  "languageCode": "en_US"
}
```

**Response Example:**

```json
{
  "success": true,
  "message": "Template hello_world sent to John Doe"
}
```

**Status Codes:**
- `200 OK`: Template message sent successfully
- `400 Bad Request`: Template name is required
- `404 Not Found`: Client not found
- `500 Internal Server Error`: Failed to send template message

### Send Template to All Clients of a Type

```
POST /marketing/send_all
```

Sends a template message to all clients of a specific type.

**Request Headers:**

| Header | Value |
|--------|-------|
| Content-Type | application/json |

**Request Body:**

```json
{
  "templateName": "hello_world",
  "clientType": "Client",
  "languageCode": "en_US"
}
```

**Response Example:**

```json
{
  "success": true,
  "message": "Template hello_world broadcast to Clients",
  "sentCount": 5,
  "failedCount": 1,
  "results": [
    {
      "clientId": "client123",
      "name": "John Doe",
      "status": "success"
    },
    {
      "clientId": "client456",
      "name": "Jane Smith",
      "status": "failed",
      "error": "Invalid phone number format"
    }
  ]
}
```

**Status Codes:**
- `200 OK`: Template messages sent successfully
- `400 Bad Request`: Template name or client type is required
- `404 Not Found`: No clients found with the specified type
- `500 Internal Server Error`: Failed to broadcast template

### Send Template by Type

```
POST /marketing/send_bay
```

Sends a template message to all clients of a specific type.

**Request Headers:**

| Header | Value |
|--------|-------|
| Content-Type | application/json |

**Request Body:**

```json
{
  "templateName": "hello_world",
  "bayType": "Broker"
}
```

**Response Example:**

```json
{
  "success": true,
  "message": "Template hello_world broadcast to Brokers",
  "sentCount": 3,
  "failedCount": 0,
  "results": [
    {
      "clientId": "client789",
      "name": "Bob Johnson",
      "status": "success"
    }
  ]
}
```

**Status Codes:**
- `200 OK`: Template messages sent successfully
- `400 Bad Request`: Template name or bay type is required
- `404 Not Found`: No clients found with the specified type
- `500 Internal Server Error`: Failed to broadcast template

### Get Campaigns

```
GET /marketing/campaigns
```

Returns a list of all campaigns.

**Response Example:**

```json
[
  {
    "id": "campaign123",
    "name": "Summer Sale",
    "status": "Active",
    "createdAt": "2023-06-01T10:20:30.456Z",
    "updatedAt": "2023-06-15T14:30:45.123Z"
  }
]
```

**Status Codes:**
- `200 OK`: Request successful
- `500 Internal Server Error`: Failed to get campaigns

## Error Handling

The API uses a consistent error response format:

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

### Common Error Codes

| Code | Status Code | Description |
|------|-------------|-------------|
| `INVALID_PARAMETER` | 400 | Missing or invalid parameter |
| `CLIENT_NOT_FOUND` | 404 | Client not found with the specified ID or phone number |
| `MESSAGE_SEND_FAILED` | 500 | Failed to send message |
| `CLIENT_UPDATE_FAILED` | 500 | Failed to update client |
| `DATABASE_ERROR` | 500 | Database error |
| `WHATSAPP_API_ERROR` | 500 | Error from WhatsApp API |
| `CONFIGURATION_ERROR` | 500 | Missing or invalid configuration |
| `UNKNOWN_ERROR` | 500 | Unexpected error |