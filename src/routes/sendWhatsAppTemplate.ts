import express, { Request, Response } from 'express';
import { sendWhatsAppTemplate } from '../services/sendWhatsAppTemplate';
import { logWithTimestamp } from '../utils/logger';

const router = express.Router();




/**
 * GET endpoint for testing the WhatsApp template message sending service
 *
 * This endpoint sends a predefined template message to a test phone number.
 * It's primarily used for testing the template sending functionality.
 *
 * @route GET /api/v1/webhook/whatsapp/sendWhatsAppTemplate
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Response} JSON response with the API result or error
 *
 * @example
 * // Example response
 * {
 *   "messaging_product": "whatsapp",
 *   "contacts": [
 *     {
 *       "input": "201015638178",
 *       "wa_id": "201015638178"
 *     }
 *   ],
 *   "messages": [
 *     {
 *       "id": "wamid.HBgMMjAxMDE1NjM4MTc4FQIAERgSNjVBRDk3QkI5QTI3QTg5RjA5AA=="
 *     }
 *   ]
 * }
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    logWithTimestamp('Received template GET request', 'info');
    const response = await sendWhatsAppTemplate('201015638178', 'hello_world_ar', 'ar');
    return res.status(200).json(response);
  } catch (error: any) {
    logWithTimestamp(`Template error: ${error.message}`, 'error');
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST endpoint for sending a WhatsApp template message
 *
 * This endpoint sends a template message to a specified phone number.
 * It accepts the phone number, template name, and optional language code
 * in the request body.
 *
 * @route POST /api/v1/webhook/whatsapp/sendWhatsAppTemplate
 * @param {Request} req - Express request object with template parameters in the body
 * @param {Response} res - Express response object
 * @returns {Response} JSON response with the API result or error
 *
 * @example
 * // Example request body
 * {
 *   "phoneNumber": "1234567890",
 *   "templateName": "hello_world",
 *   "languageCode": "en_US"
 * }
 *
 * // Example response
 * {
 *   "messaging_product": "whatsapp",
 *   "contacts": [
 *     {
 *       "input": "1234567890",
 *       "wa_id": "1234567890"
 *     }
 *   ],
 *   "messages": [
 *     {
 *       "id": "wamid.HBgMMTIzNDU2Nzg5MFQIAERgSNjVBRDk3QkI5QTI3QTg5RjA5AA=="
 *     }
 *   ]
 * }
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    logWithTimestamp('Received template POST request', 'info');

    // Get request body
    const { phoneNumber, templateName, languageCode } = req.body;

    // Send WhatsApp template message
    const response = await sendWhatsAppTemplate(phoneNumber, templateName, languageCode);

    // Return response
    return res.status(200).json(response);
  } catch (error: any) {
    logWithTimestamp(`Template error: ${error.message}`, 'error');
    return res.status(500).json({ error: error.message });
  }
});
export default router;


//   try {
//     const result = await sendWhatsAppTemplate('201015638178', 'hello_world');
//     console.log('Template sent successfully:', result);
//   } catch (error) {
//     console.error('Failed to send template:', error);
//   }