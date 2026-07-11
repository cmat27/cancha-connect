import crypto from 'crypto';
import {
  insertTeam,
  getTeamInfo,
  getAllTeams,
  addPlayerToTeam,
  getPlayersOnTeam,
} from '../data/teamRepository.js';

/**
 * Custom Error class for business logic violations.
 * This ensures our Lambda handler correctly identifies it as a 400 Bad Request
 * instead of a 500 Internal Server Error.
 */
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates business rules and orchestrates the creation of a team.
 * @param {Object} payload - The parsed JSON data from the HTTP request body
 * @returns {Object} The newly created team object
 */
export const createTeamService = async (payload) => {
  // 1. Strict Data Validation
  if (
    !payload.name ||
    typeof payload.name !== 'string' ||
    payload.name.trim() === ''
  ) {
    throw new ValidationError(
      'Team name is required and must be a text string.',
    );
  }

  if (payload.name.trim().length > 50) {
    throw new ValidationError('Team name cannot exceed 50 characters.');
  }

  if (
    !payload.coach ||
    typeof payload.coach !== 'string' ||
    payload.coach.trim() === ''
  ) {
    throw new ValidationError(
      'Coach name is required and must be a text string.',
    );
  }

  // 2. Data Preparation & Sanitization
  const teamId = crypto.randomUUID();
  const now = new Date().toISOString();

  const newTeam = {
    id: teamId,
    name: payload.name.trim(),
    coach: payload.coach.trim(),
    city:
      payload.city && typeof payload.city === 'string'
        ? payload.city.trim()
        : 'Unknown', // Optional field,
    zipcode: payload.zipcode,
    createdAt: now,
    updatedAt: now,
    status: 'PENDING_REGISTRATION',
    playerCount: payload.playerCount === undefined ? 0 : payload.playerCount, // Initialize a counter to help enforce roster limits later
  };

  // 3. Database Interaction
  // Pass the fully validated and constructed object to the data layer
  await insertTeam(newTeam);

  return newTeam;
};

// get single team info
export const getTeamService = async (teamId) => {
  if (teamId !== undefined) {
    const resp = await getTeamInfo(teamId);
    return resp;
  }
};

// get all teams info
export const getAllTeamsService = async () => {
  const resp = await getAllTeams();
  return resp;
};

/** Adds a player to a team's roster.
 * @param {string} teamId - The ID of the team
 * @param {Object} payload - The player data (playerId, jerseyNumber, role, etc.)
 * @returns {Object} The created roster record
 */
export const addPlayerToTeamService = async (teamId, payload) => {
  // 1. Validate inputs
  if (!teamId || typeof teamId !== 'string' || teamId.trim() === '') {
    throw new ValidationError('A valid Team ID is required.');
  }
  if (
    !payload.playerId ||
    typeof payload.playerId !== 'string' ||
    payload.playerId.trim() === ''
  ) {
    throw new ValidationError(
      'A valid Player ID is required to add them to the roster.',
    );
  }

  // Optional: You could call getTeamInfo(teamId) here to verify the team actually exists!

  // 2. Prepare the relational roster data
  const rosterData = {
    jerseyNumber: payload.jerseyNumber ? Number(payload.jerseyNumber) : null,
    role: payload.role ? payload.role.trim() : 'Player',
    age: payload.age ? payload.age : null,
    gender: payload.gender ? payload.gender : null,
    joinedAt: new Date().toISOString(),
  };

  // 3. Database Interaction
  try {
    const rosterRecord = await addPlayerToTeam(
      teamId.trim(),
      payload.playerId.trim(),
      rosterData,
    );
    return rosterRecord;
  } catch (error) {
    // DynamoDB throws this specific error if the ConditionExpression fails
    // (meaning the player is already on this specific team's roster)
    if (error.name === 'ConditionalCheckFailedException') {
      throw new ValidationError(
        "This player is already registered on this team's roster.",
      );
    }
    throw error;
  }
};

export const getPlayersOnTeamService = async (teamId) => {
  if (teamId !== undefined) {
    const resp = await getPlayersOnTeam(teamId);
    return resp;
  }
};
