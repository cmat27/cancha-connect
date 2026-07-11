import {
  createTeamService,
  getTeamService,
  getAllTeamsService,
  addPlayerToTeamService,
  getPlayersOnTeamService,
} from '../services/teamService.js';
import { formatResponse, formatError } from '../utils/responseFormatter.js';

// team routes based on path
const teamRoutesRegistry = [
  {
    method: 'POST',
    regex: /^\/teams\/create\/?$/,
    handler: async (event) => await handleCreateTeam(event),
  },
  {
    method: 'GET',
    regex: /^\/teams\/teamInfo\/?$/,
    handler: async () => await handleGetTeams(),
  },
  {
    method: 'GET',
    regex: /^\/teams\/teamInfo\/([^\/]+)\/?$/,
    handler: async (event, match) => await handleGetTeam(match[1]), // match[1] is the teamId
  },
  {
    method: 'POST',
    regex: /^\/teams\/roster\/([^\/]+)\/players\/?$/,
    handler: async (event, match) =>
      await handlesAddPlayerToTeam(event, match[1]),
  },
  {
    method: 'GET',
    regex: /^\/teams\/rosterInfo\/([^\/]+)\/players\/?$/,
    handler: async (event, match) => await handlesGetTeamRoster(match[1]),
  },
];

/**
 * AWS Lambda Handler: POST /teams
 * * @param {Object} event - The API Gateway HTTP API v2 event object.
 * * @param {string} path - string
 * @returns {Object} API Gateway formatted HTTP response.
 */
export const teamRoutes = async (event, path) => {
  const httpMethod =
    event.requestContext?.http?.method || event.httpMethod || 'GET';

  // Iterate through the registry to find a matching method and path
  for (const route of teamRoutesRegistry) {
    if (route.method === httpMethod) {
      const match = path.match(route.regex);

      if (match) {
        return await route.handler(event, match);
      }
    }
  }
  //incase rout is not matched
  return {
    statusCode: 404,
    body: JSON.stringify({ message: `Route ${httpMethod} ${path} not found.` }),
  };
};

//creates teams
const handleCreateTeam = async (event) => {
  if (!event.body) return formatError(400, 'Missing request body.');

  let payload;
  try {
    const bodyString = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf-8')
      : event.body;
    payload = JSON.parse(bodyString);
  } catch (e) {
    return formatError(400, 'Invalid JSON in request body.');
  }

  try {
    const createdTeam = await createTeamService(payload);
    return formatResponse(201, { message: 'Team created!', team: createdTeam });
  } catch (error) {
    if (error.name === 'ValidationError')
      return formatError(400, error.message);
    throw error;
  }
};
//gets single team by teamId
const handleGetTeam = async (teamId) => {
  try {
    const team = await getTeamService(teamId);
    if (!team) return formatError(404, `Team ${teamId} not found.`);
    return formatResponse(200, team);
  } catch (error) {
    if (error.name === 'ValidationError')
      return formatError(400, error.message);
    throw error;
  }
};
//gets all teams
const handleGetTeams = async (event) => {
  const allTeams = await getAllTeamsService();
  return formatResponse(200, allTeams);
};
//Adds player to team roster
const handlesAddPlayerToTeam = async (event, teamId) => {
  if (teamId.trim() === '') return formatError(400, 'Missing teamId.');
  if (!event.body) return formatError(400, 'Missing request body.');

  let payload;
  try {
    const bodyString = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf-8')
      : event.body;
    payload = JSON.parse(bodyString);
  } catch (e) {
    return formatError(400, 'Invalid JSON in request body.');
  }

  // insert player
  try {
    const playerAdded = await addPlayerToTeamService(teamId, payload);
    return formatResponse(201, {
      message: 'Player added!',
      player: playerAdded,
    });
  } catch (error) {
    if (error.name === 'ValidationError')
      return formatError(400, error.message);
    throw error;
  }
};
//gets the team roster
const handlesGetTeamRoster = async (teamId) => {
  const teamRoster = await getPlayersOnTeamService(teamId);
  return formatResponse(200, teamRoster);
};
