import express, { Request, Response } from 'express';
import { logWithTimestamp } from '../utils/logger';
import validateWebhookVerification from '../utils/validateWebhookVerification';
import WebhookQuery from '../interfaces/WebhookQuery';

const router = express.Router();

/**
 * GET endpoint for WhatsApp webhook verification
 *
 * This endpoint is used by Meta to verify the webhook during initial setup
 * and periodic verification checks. It validates the verification token
 * and responds with the challenge string if verification is successful.
 *
 * @route GET /api/v1/webhook/whatsapp
 * @param {Request} req - Express request object with webhook verification query parameters
 * @param {Response} res - Express response object
 * @returns {Response} The challenge string if verification is successful, or an error message
 *
 * @example
 * // Example verification request
 * GET /api/v1/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=your_token&hub.challenge=challenge_string
 */
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
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logWithTimestamp(`Verification error: ${errorMessage}`, 'error');
    return res.status(500).send(errorMessage);
  }
});

// Export using CommonJS syntax
export default router;

// Usage in your main app.ts file:
// const webhookRoutes = require('./routes/webhook');
// app.use('/webhook', webhookRoutes);
