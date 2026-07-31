import {
  createTournamentService,
  getTournamentService,
  getAllTournamentsService,
  registerTeamForTournamentService,
  getTeamsInTournamentService,
} from '../services/tournamentService.js';
import { formatResponse, formatError } from '../utils/responseFormatter.js';

const parseRequestBody = (event) => {
  if (!event.body) throw new Error('Missing request body.');
  const bodyString = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf-8')
    : event.body;
  return JSON.parse(bodyString);
};

export const tournamentRoutes = async (event, path, method) => {
  try {
    // 1. GET /tournaments -> Get all tournaments
    if (method === 'GET' && (path === '/tournaments' || path === '/tournaments/')) {
      const tournaments = await getAllTournamentsService();
      return formatResponse(200, tournaments);
    }

    // 2. POST /tournaments -> Create tournament
    if (method === 'POST' && (path === '/tournaments' || path === '/tournaments/')) {
      const payload = parseRequestBody(event);
      const createdTournament = await createTournamentService(payload);
      return formatResponse(201, { message: 'Tournament created successfully.', tournament: createdTournament });
    }

    // Regex matches
    const getTournamentMatch = path.match(/^\/tournaments\/([^\/]+)\/?$/);
    const tournamentTeamsMatch = path.match(/^\/tournaments\/([^\/]+)\/teams\/?$/);

    // 3. POST /tournaments/:id/teams -> Register team for tournament
    if (method === 'POST' && tournamentTeamsMatch) {
      const tourneyId = tournamentTeamsMatch[1];
      const payload = parseRequestBody(event);
      const registration = await registerTeamForTournamentService(tourneyId, payload);
      return formatResponse(201, { message: 'Team registered for tournament successfully.', registration });
    }

    // 4. GET /tournaments/:id/teams -> Get teams in tournament
    if (method === 'GET' && tournamentTeamsMatch) {
      const tourneyId = tournamentTeamsMatch[1];
      const teams = await getTeamsInTournamentService(tourneyId);
      return formatResponse(200, teams);
    }

    // 5. GET /tournaments/:id -> Get single tournament
    if (method === 'GET' && getTournamentMatch) {
      const tourneyId = getTournamentMatch[1];
      const tournament = await getTournamentService(tourneyId);
      if (!tournament) return formatError(404, `Tournament with ID ${tourneyId} not found.`);
      return formatResponse(200, tournament);
    }

    return formatError(404, `Tournament route ${method} ${path} not found.`);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return formatError(400, error.message);
    }
    if (error instanceof SyntaxError) {
      return formatError(400, 'Invalid JSON payload in request body.');
    }
    console.error(`[TournamentHandler Error] ${method} ${path}:`, error);
    return formatError(500, 'Internal server error processing tournament request.');
  }
};
