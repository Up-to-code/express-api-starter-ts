/**
 * Interface for WhatsApp webhook verification query parameters
 * These parameters are sent by Meta when verifying the webhook endpoint
 * @interface WebhookQuery
 */
export default interface WebhookQuery {
  /**
   * The mode of the verification request, should be "subscribe"
   */
  "hub.mode"?: string;

  /**
   * The verification token that should match the one configured in the environment
   */
  "hub.verify_token"?: string;

  /**
   * The challenge string that must be echoed back to complete verification
   */
  "hub.challenge"?: string;

  /**
   * Additional query parameters that might be present
   */
  [key: string]: string | undefined;
}
