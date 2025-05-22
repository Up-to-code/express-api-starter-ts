type LogLevel = 'info' | 'warning' | 'error' | 'success' | 'debug';

/**
 * Log a message with a timestamp
 * @param {string} message - Message to log
 * @param {LogLevel} level - Log level
 */
export function logWithTimestamp(message: string, level: LogLevel = 'info'): void {
  const timestamp = new Date().toISOString();
  let emoji = '📝';

  switch (level) {
    case 'info':
      emoji = '📝';
      break;
    case 'warning':
      emoji = '⚠️';
      break;
    case 'error':
      emoji = '❌';
      break;
    case 'success':
      emoji = '✅';
      break;
    case 'debug':
      emoji = '🔍';
      break;
  }

  console.log(`[${timestamp}] ${emoji} ${level.toUpperCase()}: ${message}`);
}

/**
 * Log an error with stack trace
 * @param {Error} error - Error object
 * @param {string} context - Context where the error occurred
 */
export function logError(error: Error, context = ''): void {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` in ${context}` : '';
  console.error(`[${timestamp}] ❌ ERROR${contextStr}: ${error.message}`);
  console.error(`Stack trace: ${error.stack}`);
}

/**
 * Log a database query
 * @param {string} query - SQL query
 * @param {any[]} params - Query parameters
 * @param {number} duration - Query duration in ms
 */
export function logQuery(query: string, params: any[] = [], duration = 0): void {
  if (process.env.NODE_ENV !== 'production') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔍 QUERY (${duration}ms): ${query}`);
    if (params.length > 0) {
      console.log(`Parameters: ${JSON.stringify(params)}`);
    }
  }
}

/**
 * Log an API request
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {number} status - Response status code
 * @param {number} duration - Request duration in ms
 */
export function logApiRequest(method: string, url: string, status: number, duration: number): void {
  const timestamp = new Date().toISOString();
  const emoji = status >= 200 && status < 300 ? '✅' : status >= 400 ? '❌' : '⚠️';
  console.log(`[${timestamp}] ${emoji} API: ${method} ${url} ${status} in ${duration}ms`);
}
