// Utility function for logging with timestamp
function logWithTimestamp(
  message: string,
  level: "info" | "error" | "warn" | "debug" = "info"
): void {
  const timestamp = new Date().toISOString();
  console[level](`[${timestamp}] ${message}`);
}

export default logWithTimestamp;
