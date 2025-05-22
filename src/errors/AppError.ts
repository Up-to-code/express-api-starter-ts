/**
 * Base error class for application-specific errors
 * 
 * This class extends the built-in Error class to provide additional
 * functionality for application-specific errors.
 */
export class AppError extends Error {
  /**
   * HTTP status code to return to the client
   */
  public statusCode: number;

  /**
   * Whether this is an operational error (expected in normal operation)
   * or a programming error (unexpected bug)
   */
  public isOperational: boolean;

  /**
   * Creates a new AppError
   * 
   * @param message - Error message
   * @param statusCode - HTTP status code (default: 500)
   * @param isOperational - Whether this is an operational error (default: true)
   */
  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
    
    // Set the prototype explicitly
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Error thrown when there's a problem with configuration
 */
export class ConfigurationError extends AppError {
  constructor(message: string) {
    super(`Configuration error: ${message}`, 500, true);
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

/**
 * Error thrown when there's a problem sending a message
 */
export class MessageSendError extends AppError {
  constructor(message: string) {
    super(`Failed to send message: ${message}`, 500, true);
    Object.setPrototypeOf(this, MessageSendError.prototype);
  }
}

/**
 * Error thrown when there's a problem updating a client
 */
export class ClientUpdateError extends AppError {
  constructor(message: string) {
    super(`Failed to update client: ${message}`, 500, true);
    Object.setPrototypeOf(this, ClientUpdateError.prototype);
  }
}

/**
 * Error thrown when a client is not found
 */
export class ClientNotFoundError extends AppError {
  constructor(phone: string) {
    super(`Client not found with phone: ${phone}`, 404, true);
    Object.setPrototypeOf(this, ClientNotFoundError.prototype);
  }
}

/**
 * Error thrown when there's a problem with the WhatsApp API
 */
export class WhatsAppApiError extends AppError {
  constructor(message: string) {
    super(`WhatsApp API error: ${message}`, 500, true);
    Object.setPrototypeOf(this, WhatsAppApiError.prototype);
  }
}
