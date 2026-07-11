/**
 * Standardizes API Gateway HTTP responses.
 * By keeping this here, our handlers remain very clean.
 */
export const formatResponse = (statusCode, body) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // Adjust this in production for CORS security
    },
    body: JSON.stringify(body),
  };
};

export const formatError = (statusCode, message) => {
  return formatResponse(statusCode, { error: message });
};
