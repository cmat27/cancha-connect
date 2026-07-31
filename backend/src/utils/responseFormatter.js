/**
 * Standardizes API Gateway HTTP responses.
 * Enforces JSON headers and configurable CORS headers across all handlers.
 */
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

export const formatResponse = (statusCode, body) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  };
};

export const formatError = (statusCode, message) => {
  return formatResponse(statusCode, { error: message });
};

