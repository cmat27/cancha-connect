import crypto from 'crypto';
import { z } from 'zod';
import {
  insertTeam,
  getTeamInfo,
  getAllTeams,
  addPlayerToTeam,
  getPlayersOnTeam,
  getTournamentsForTeam,
} from '../data/teamRepository.js';

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

const createTeamSchema = z.object({
  name: z.string({ message: 'Team name is required.' })
    .trim()
    .min(1, 'Team name cannot be empty.')
    .max(50, 'Team name cannot exceed 50 characters.'),
  coach: z.string({ message: 'Coach name is required.' })
    .trim()
    .min(1, 'Coach name cannot be empty.')
    .max(50, 'Coach name cannot exceed 50 characters.'),
  city: z.string().trim().optional().default('Unknown'),
  zipcode: z.string().trim().optional(),
});

const addPlayerSchema = z.object({
  playerId: z.string({ required_error: 'Player ID is required.' }).trim().min(1, 'Player ID cannot be empty.'),
  jerseyNumber: z.coerce.number().int().min(0).max(99).optional().nullable(),
  role: z.string().trim().optional().default('Player'),
  age: z.coerce.number().int().min(1).max(120).optional().nullable(),
  gender: z.string().trim().optional().nullable(),
});

export const createTeamService = async (payload) => {
  const result = createTeamSchema.safeParse(payload);
  if (!result.success) {
    const errorMsg = result.error.issues.map((e) => e.message).join(' ');
    throw new ValidationError(errorMsg);
  }

  const data = result.data;
  const teamId = crypto.randomUUID();
  const now = new Date().toISOString();

  const newTeam = {
    id: teamId,
    name: data.name,
    coach: data.coach,
    city: data.city,
    ...(data.zipcode ? { zipcode: data.zipcode } : {}),
    createdAt: now,
    updatedAt: now,
    status: 'PENDING_REGISTRATION',
    playerCount: 0,
  };

  await insertTeam(newTeam);
  return newTeam;
};

export const getTeamService = async (teamId) => {
  if (!teamId || typeof teamId !== 'string' || teamId.trim() === '') {
    throw new ValidationError('A valid Team ID is required.');
  }
  return await getTeamInfo(teamId.trim());
};

export const getAllTeamsService = async () => {
  return await getAllTeams();
};

export const addPlayerToTeamService = async (teamId, payload) => {
  if (!teamId || typeof teamId !== 'string' || teamId.trim() === '') {
    throw new ValidationError('A valid Team ID is required.');
  }

  const result = addPlayerSchema.safeParse(payload);
  if (!result.success) {
    const errorMsg = result.error.issues.map((e) => e.message).join(' ');
    throw new ValidationError(errorMsg);
  }

  const team = await getTeamInfo(teamId.trim());
  if (!team) {
    throw new ValidationError(`Team with ID ${teamId} does not exist.`);
  }

  const data = result.data;
  const rosterData = {
    jerseyNumber: data.jerseyNumber ?? null,
    role: data.role,
    age: data.age ?? null,
    gender: data.gender ?? null,
    joinedAt: new Date().toISOString(),
  };

  try {
    return await addPlayerToTeam(teamId.trim(), data.playerId, rosterData);
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw new ValidationError("This player is already registered on this team's roster.");
    }
    throw error;
  }
};

export const getPlayersOnTeamService = async (teamId) => {
  if (!teamId || typeof teamId !== 'string' || teamId.trim() === '') {
    throw new ValidationError('A valid Team ID is required.');
  }
  return await getPlayersOnTeam(teamId.trim());
};

export const getTeamTournamentsService = async (teamId) => {
  if (!teamId || typeof teamId !== 'string' || teamId.trim() === '') {
    throw new ValidationError('A valid Team ID is required.');
  }
  return await getTournamentsForTeam(teamId.trim());
};
