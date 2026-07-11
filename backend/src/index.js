import { handler as getTeamHandler } from './handlers/getTeams.js';
import { teamRoutes } from './handlers/teamHandler.js';
import { formatResponse, formatError } from './utils/responseFormatter.js';

/**
 * Main Lambda Handler - The "Monolithic Router"
 * API Gateway sends ALL requests to this function. We route them based on the HTTP method and path.
 */
export const handler = async (event) => {
  const method = event.requestContext?.http?.method;
  const path = event.rawPath || event.path; // Fallback for path too

  console.log(`[ROUTER] Received request: ${method} ${path}`);

  try {
    // --- ROUTING LOGIC ---

    if (path.startsWith('/teams')) return await teamRoutes(event, path);

    // If no route matches, return a 404 Not Found
    return formatError(404, `Route ${method} ${path} not found.`);
  } catch (error) {
    console.error('[ROUTER] Unhandled Error:', error);
    return formatError(500, 'Internal Server Error');
  }
};
