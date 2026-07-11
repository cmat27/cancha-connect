import { getTeamService, getAllTeamsService } from '../services/teamService.js';
import { formatResponse, formatError } from '../utils/responseFormatter.js';
/**
 * AWS Lambda Handler: GET /teams/{id}
 */
export const handler = async (event) => {
  console.info('Received event to get team(s):', event.rawPath);

  try {
    const pathParts = event.rawPath.split('/');

    // Safely attempt to extract an ID from any possible location
    const teamId =
      event.pathParameters?.id ||
      event.queryStringParameters?.id ||
      pathParts[3];

    // ==========================================
    //  GET SINGLE TEAM
    // ==========================================
    if (teamId) {
      console.info(`Fetching single team with ID: ${teamId}`);
      const team = await getTeamService(teamId);

      // If the service returns null, the team doesn't exist
      if (!team) {
        return formatError(404, `Team with ID ${teamId} not found.`);
      }

      return formatResponse(200, team);
    }

    // ==========================================
    // SCENARIO 2: NO ID PROVIDED -> GET ALL TEAMS
    // ==========================================
    console.info('No ID provided, fetching all teams.');

    // Replace 'getAllTeamsService' with whatever your actual service function is called
    const allTeams = await getAllTeamsService();

    return formatResponse(200, allTeams);
  } catch (error) {
    console.error('Error retrieving team(s):', error);

    if (error.name === 'ValidationError') {
      return formatError(400, error.message);
    }

    return formatError(
      500,
      'An internal server error occurred while retrieving the team(s).',
    );
  }
};
