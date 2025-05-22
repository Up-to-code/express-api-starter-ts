
/**
 * Represents a WhatsApp message received through the webhook
 * @interface WhatsAppMessage
 */
export interface WhatsAppMessage {
  /** The phone number of the sender in international format */
  from: string
  /** Unique identifier for the message */
  id: string
  /** ISO timestamp when the message was sent */
  timestamp: string
  /** Type of message (text, image, audio, etc.) */
  type: string
  /** Content of the message if it's a text message */
  text?: {
    /** The actual text content of the message */
    body: string
  }
}

/**
 * Represents a WhatsApp contact information received in the webhook
 * @interface WhatsAppContact
 */
export interface WhatsAppContact {
  /** Profile information of the contact */
  profile: {
    /** Display name of the contact */
    name: string
  }
  /** WhatsApp ID of the contact (usually the phone number) */
  wa_id: string
}

/**
 * Represents the complete webhook payload structure from WhatsApp Business API
 * @interface WhatsAppWebhook
 */
export interface WhatsAppWebhook {
  /** The type of object, should be "whatsapp_business_account" */
  object: string
  /** Array of entry objects containing the webhook data */
  entry: Array<{
    /** ID of the WhatsApp Business Account */
    id: string
    /** Array of changes that triggered the webhook */
    changes: Array<{
      /** The value object containing the actual webhook data */
      value: {
        /** Should be "whatsapp" */
        messaging_product: string
        /** Metadata about the WhatsApp Business Account */
        metadata: {
          /** The display phone number */
          display_phone_number: string
          /** The phone number ID */
          phone_number_id: string
        }
        /** Array of contacts if present in the webhook */
        contacts?: WhatsAppContact[]
        /** Array of messages if present in the webhook */
        messages?: WhatsAppMessage[]
        /** Array of status updates if present in the webhook */
        statuses?: any[]
      }
      /** The field that changed, usually "messages" */
      field: string
    }>
  }>
}

