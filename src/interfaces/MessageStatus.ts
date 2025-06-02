/**
 * WhatsApp message status types
 */
export type MessageStatusType = 
  | 'sent'        // Message sent to WhatsApp
  | 'delivered'   // Message delivered to recipient's device
  | 'read'        // Message read by recipient
  | 'failed'      // Message failed to send

/**
 * WhatsApp status update interface
 */
export interface WhatsAppStatus {
  /** Message ID that this status refers to */
  id: string;
  /** Status of the message */
  status: MessageStatusType;
  /** Timestamp when the status was updated */
  timestamp: string;
  /** Recipient phone number */
  recipient_id: string;
  /** Conversation ID */
  conversation?: {
    id: string;
    origin?: {
      type: string;
    };
  };
  /** Pricing information */
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
  };
  /** Error information if status is 'failed' */
  errors?: Array<{
    code: number;
    title: string;
    message: string;
    error_data?: {
      details: string;
    };
  }>;
}

/**
 * Enhanced WhatsApp message interface with tracking
 */
export interface TrackedWhatsAppMessage {
  /** Message ID from WhatsApp */
  whatsappMessageId: string;
  /** Internal database message ID */
  internalMessageId: string;
  /** Recipient phone number */
  to: string;
  /** Message content */
  content: string;
  /** Current status */
  status: MessageStatusType;
  /** Timestamp when message was sent */
  sentAt: Date;
  /** Timestamp when message was delivered */
  deliveredAt?: Date;
  /** Timestamp when message was read */
  readAt?: Date;
  /** Timestamp when status was last updated */
  lastStatusUpdate: Date;
  /** Whether this message expects a response */
  expectsResponse: boolean;
  /** Whether this is an automated response */
  isAutomated: boolean;
  /** Source of the response (QA Database, AI Agent, etc.) */
  responseSource?: string;
}

/**
 * Message delivery report interface
 */
export interface MessageDeliveryReport {
  /** Total messages sent */
  totalSent: number;
  /** Messages delivered */
  delivered: number;
  /** Messages read */
  read: number;
  /** Messages failed */
  failed: number;
  /** Delivery rate percentage */
  deliveryRate: number;
  /** Read rate percentage */
  readRate: number;
  /** Average delivery time in seconds */
  avgDeliveryTime?: number;
  /** Average read time in seconds */
  avgReadTime?: number;
}

/**
 * Read receipt configuration
 */
export interface ReadReceiptConfig {
  /** Whether to track read receipts */
  enabled: boolean;
  /** Whether to send read receipts for incoming messages */
  sendReadReceipts: boolean;
  /** Timeout for delivery confirmation in seconds */
  deliveryTimeout: number;
  /** Timeout for read confirmation in seconds */
  readTimeout: number;
}

export default {
  WhatsAppStatus,
  TrackedWhatsAppMessage,
  MessageDeliveryReport,
  ReadReceiptConfig
};
