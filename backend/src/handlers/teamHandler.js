import {
  createTeamService,
  getTeamService,
  getAllTeamsService,
  addPlayerToTeamService,
  getPlayersOnTeamService,
  getTeamTournamentsService,
} from '../services/teamService.js';
import { formatResponse, formatError } from '../utils/responseFormatter.js';

const parseRequestBody = (event) => {
  if (!event.body) throw new Error('Missing request body.');
  const bodyString = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf-8')
    : event.body;
  return JSON.parse(bodyString);
};

export const teamRoutes = async (event, path, method) => {
  try {
    // 1. GET /teams or GET /teams/teamInfo -> Get all teams
    if (method === 'GET' && (path === '/teams' || path === '/teams/' || path === '/teams/teamInfo' || path === '/teams/teamInfo/')) {
      const teams = await getAllTeamsService();
      return formatResponse(200, teams);
    }

    // 2. POST /teams or POST /teams/create -> Create team
    if (method === 'POST' && (path === '/teams' || path === '/teams/' || path === '/teams/create' || path === '/teams/create/')) {
      const payload = parseRequestBody(event);
      const createdTeam = await createTeamService(payload);
      return formatResponse(201, { message: 'Team created successfully.', team: createdTeam });
    }

    // Match patterns with IDs
    const teamInfoMatch = path.match(/^\/teams\/teamInfo\/([^\/]+)\/?$/);
    const getTeamMatch = path.match(/^\/teams\/([^\/]+)\/?$/);
    const rosterAddMatch = path.match(/^\/teams\/rosterAdd\/([^\/]+)\/players\/?$/);
    const playersMatch = path.match(/^\/teams\/([^\/]+)\/players\/?$/);
    const rosterInfoMatch = path.match(/^\/teams\/rosterInfo\/([^\/]+)\/players\/?$/);
    const tournamentsInfoMatch = path.match(/^\/teams\/tournamentsInfo\/([^\/]+)\/?$/);
    const tournamentsMatch = path.match(/^\/teams\/([^\/]+)\/tournaments\/?$/);

    // 3. GET /teams/:id or GET /teams/teamInfo/:id -> Get single team
    if (method === 'GET' && (getTeamMatch || teamInfoMatch)) {
      const teamId = (getTeamMatch || teamInfoMatch)[1];
      const team = await getTeamService(teamId);
      if (!team) return formatError(404, `Team with ID ${teamId} not found.`);
      return formatResponse(200, team);
    }

    // 4. POST /teams/:id/players or POST /teams/rosterAdd/:id/players -> Add player to team roster
    if (method === 'POST' && (playersMatch || rosterAddMatch)) {
      const teamId = (playersMatch || rosterAddMatch)[1];
      const payload = parseRequestBody(event);
      const rosterRecord = await addPlayerToTeamService(teamId, payload);
      return formatResponse(201, { message: 'Player added to team roster.', roster: rosterRecord });
    }

    // 5. GET /teams/:id/players or GET /teams/rosterInfo/:id/players -> Get team roster
    if (method === 'GET' && (playersMatch || rosterInfoMatch)) {
      const teamId = (playersMatch || rosterInfoMatch)[1];
      const roster = await getPlayersOnTeamService(teamId);
      return formatResponse(200, roster);
    }

    // 6. GET /teams/:id/tournaments or GET /teams/tournamentsInfo/:id -> Get team tournaments
    if (method === 'GET' && (tournamentsMatch || tournamentsInfoMatch)) {
      const teamId = (tournamentsMatch || tournamentsInfoMatch)[1];
      const tournaments = await getTeamTournamentsService(teamId);
      return formatResponse(200, tournaments);
    }

    return formatError(404, `Team route ${method} ${path} not found.`);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return formatError(400, error.message);
    }
    if (error instanceof SyntaxError) {
      return formatError(400, 'Invalid JSON payload in request body.');
    }
    console.error(`[TeamHandler Error] ${method} ${path}:`, error);
    return formatError(500, 'Internal server error processing team request.');
  }
};
