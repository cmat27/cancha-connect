import {
  createPlayerService,
  getPlayerService,
  getAllPlayersService,
  getTeamsForPlayerService,
} from '../services/playerService.js';
import { formatResponse, formatError } from '../utils/responseFormatter.js';

const parseRequestBody = (event) => {
  if (!event.body) throw new Error('Missing request body.');
  const bodyString = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf-8')
    : event.body;
  return JSON.parse(bodyString);
};

export const playerRoutes = async (event, path, method) => {
  try {
    // 1. GET /players -> Get all players
    if (method === 'GET' && (path === '/players' || path === '/players/')) {
      const players = await getAllPlayersService();
      return formatResponse(200, players);
    }

    // 2. POST /players -> Create player
    if (method === 'POST' && (path === '/players' || path === '/players/')) {
      const payload = parseRequestBody(event);
      const createdPlayer = await createPlayerService(payload);
      return formatResponse(201, { message: 'Player created successfully.', player: createdPlayer });
    }

    // Regex matches
    const getPlayerMatch = path.match(/^\/players\/([^\/]+)\/?$/);
    const getPlayerTeamsMatch = path.match(/^\/players\/([^\/]+)\/teams\/?$/);

    // 3. GET /players/:id/teams -> Get teams for player
    if (method === 'GET' && getPlayerTeamsMatch) {
      const playerId = getPlayerTeamsMatch[1];
      const teams = await getTeamsForPlayerService(playerId);
      return formatResponse(200, teams);
    }

    // 4. GET /players/:id -> Get single player
    if (method === 'GET' && getPlayerMatch) {
      const playerId = getPlayerMatch[1];
      const player = await getPlayerService(playerId);
      if (!player) return formatError(404, `Player with ID ${playerId} not found.`);
      return formatResponse(200, player);
    }

    return formatError(404, `Player route ${method} ${path} not found.`);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return formatError(400, error.message);
    }
    if (error instanceof SyntaxError) {
      return formatError(400, 'Invalid JSON payload in request body.');
    }
    console.error(`[PlayerHandler Error] ${method} ${path}:`, error);
    return formatError(500, 'Internal server error processing player request.');
  }
};
