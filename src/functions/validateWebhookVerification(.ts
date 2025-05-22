// Webhook Verification
function validateWebhookVerification(
    mode: string | null,
    token: string | null,
    verifyToken: string | undefined
  ) {
    return mode === "subscribe" && token === verifyToken;
  }

  export { validateWebhookVerification }