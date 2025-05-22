
/**
 * Validates the WhatsApp webhook verification request parameters
 *
 * This function checks if the mode is "subscribe" and if the token matches the verification token
 * configured in the environment variables. This is used during the initial webhook setup
 * and verification by Meta.
 *
 * @param {string | null} mode - The hub.mode parameter from the webhook verification request
 * @param {string | null} token - The hub.verify_token parameter from the webhook verification request
 * @param {string | undefined} verifyToken - The verification token from environment variables
 * @returns {boolean} True if verification is successful, false otherwise
 *
 * @example
 * // In a webhook verification route
 * const mode = req.query['hub.mode'];
 * const token = req.query['hub.verify_token'];
 * const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
 *
 * if (validateWebhookVerification(mode, token, verifyToken)) {
 *   return res.status(200).send(req.query['hub.challenge']);
 * } else {
 *   return res.status(403).send('Verification failed');
 * }
 */
function validateWebhookVerification(
    mode: string | null,
    token: string | null,
    verifyToken: string | undefined
  ): boolean {
    return mode === "subscribe" && token === verifyToken;
  }

export default validateWebhookVerification;
