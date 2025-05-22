
import express, { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { MessageServiceFactory } from '../../factories/MessageServiceFactory';
import { logWithTimestamp } from '../../utils/logger';

const router = express.Router();

// Create service using factory
const messageService = MessageServiceFactory.createDefault(prisma);

/**
 * POST endpoint for sending a WhatsApp message
 *
 * This endpoint sends a text message to a specified phone number and
 * updates the client's last message in the database.
 *
 * @route POST /api/v1/sendWhatsAppMessage
 * @param {Request} req - Express request object with message parameters in the body
 * @param {Response} res - Express response object
 * @returns {Response} JSON response indicating success or error
 *
 * @example
 * // Example request body
 * {
 *   "to": "1234567890",
 *   "text": "Hello, this is a test message!"
 * }
 *
 * // Example success response
 * {
 *   "success": true
 * }
 *
 * // Example error response
 * {
 *   "success": false,
 *   "error": {
 *     "message": "Client not found with phone: 1234567890",
 *     "code": "CLIENT_NOT_FOUND",
 *     "statusCode": 404
 *   }
 * }
 */
router.post('/', async (req: Request, res: Response) => {
  // Validate request body
  const { to, text } = req.body;

  if (!to || typeof to !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Missing or invalid recipient phone number',
        code: 'INVALID_PARAMETER',
        statusCode: 400,
      },
    });
  }

  if (!text || typeof text !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Missing or invalid message text',
        code: 'INVALID_PARAMETER',
        statusCode: 400,
      },
    });
  }

  // Log the request
  logWithTimestamp(`Sending WhatsApp message to ${to}`, 'info');

  // Send the message and update the client
  const result = await messageService.sendMessageAndUpdateClient(to, text);

  // Return the result
  if (result.success) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(result.error?.statusCode || 500).json({
      success: false,
      error: result.error,
    });
  }
});

export default router;