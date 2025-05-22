/**
 * Validates the structure of a WhatsApp webhook message or status update
 *
 * @param {any} value - The value object from the webhook payload to validate
 * @returns {boolean} True if the message data structure is valid, false otherwise
 *
 * @example
 * // Check if webhook data is valid
 * if (!isValidMessageData(value)) {
 *   return res.status(400).json({ error: 'Invalid message data' });
 * }
 */
function isValidMessageData(value: any): boolean {
  // Check if this is a status update
  if (value &&
      typeof value === 'object' &&
      'messaging_product' in value &&
      value.messaging_product === 'whatsapp' &&
      'statuses' in value &&
      Array.isArray(value.statuses) &&
      value.statuses.length > 0) {
    return true;
  }

  // Check if this is a message
  return (
    value &&
    typeof value === 'object' &&
    'messaging_product' in value &&
    value.messaging_product === 'whatsapp' &&
    'metadata' in value &&
    'messages' in value &&
    Array.isArray(value.messages) &&
    value.messages.length > 0 &&
    'from' in value.messages[0] &&
    'id' in value.messages[0] &&
    'timestamp' in value.messages[0] &&
    'type' in value.messages[0]
  );
}

export { isValidMessageData };
