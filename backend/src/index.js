import { teamRoutes } from './handlers/teamHandler.js';
import { playerRoutes } from './handlers/playerHandler.js';
import { tournamentRoutes } from './handlers/tournamentHandler.js';
import { formatResponse, formatError } from './utils/responseFormatter.js';

/**
 * Main Lambda Handler - The Monolithic Router
 * API Gateway routes all incoming requests to this function.
 */
export const handler = async (event) => {
  const method =
    event.requestContext?.http?.method ||
    event.httpMethod ||
    'GET';
  const path = event.rawPath || event.path || '/';

  console.log(`[ROUTER] Received request: ${method} ${path}`);

  // Handle Global CORS Preflight Options Request
  if (method === 'OPTIONS') {
    return formatResponse(200, { status: 'OK' });
  }

  try {
    if (path.startsWith('/teams')) {
      return await teamRoutes(event, path, method);
    }

    if (path.startsWith('/players')) {
      return await playerRoutes(event, path, method);
    }

    if (path.startsWith('/tournaments')) {
      return await tournamentRoutes(event, path, method);
    }

    // Health check endpoint
    if (path === '/' || path === '/health') {
      return formatResponse(200, {
        service: 'CanchaConnect API',
        status: 'UP',
        timestamp: new Date().toISOString(),
      });
    }

    return formatError(404, `Route ${method} ${path} not found.`);
  } catch (error) {
    console.error('[ROUTER] Unhandled Error:', error);
    return formatError(500, 'Internal Server Error');
  }
};
