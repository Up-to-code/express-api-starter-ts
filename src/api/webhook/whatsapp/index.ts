import express from 'express';

import Verification from '../../../routes/Verification';
import WebHook from '../../../routes/WebHook';
import SendWhatsAppTemplate from '../../../routes/sendWhatsAppTemplate';

/**
 * WhatsApp webhook router
 *
 * This router combines multiple route handlers for WhatsApp webhook functionality:
 * 1. Verification - Handles webhook verification requests (GET)
 * 2. WebHook - Handles incoming webhook events (POST)
 * 3. SendWhatsAppTemplate - Handles template message sending
 *
 * @module WhatsAppWebhookRouter
 */
const router = express.Router();

// Mount the verification handler for GET requests
router.use('/', Verification);

// Mount the webhook handler for POST requests
router.use('/', WebHook);

// Mount the template sending handler for the /sendWhatsAppTemplate path
router.use('/sendWhatsAppTemplate', SendWhatsAppTemplate);

export default router;
