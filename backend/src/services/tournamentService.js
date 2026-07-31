import crypto from 'crypto';
import { z } from 'zod';
import { ValidationError } from './teamService.js';
import {
  insertTournament,
  getSingleTournament,
  getAllTournaments,
  registerTeamForTournament,
  getTeamsInTournament,
} from '../data/tournamentRepository.js';
import { getTeamInfo } from '../data/teamRepository.js';

const createTournamentSchema = z.object({
  name: z.string({ message: 'Tournament name is required.' })
    .trim()
    .min(1, 'Tournament name cannot be empty.')
    .max(100, 'Tournament name cannot exceed 100 characters.'),
  location: z.string().trim().optional().default('TBD'),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  maxTeams: z.coerce.number().int().positive().optional().default(16),
});

const registerTeamSchema = z.object({
  teamId: z.string({ required_error: 'Team ID is required.' }).trim().min(1, 'Team ID cannot be empty.'),
  division: z.string().trim().optional().default('Open'),
});

export const createTournamentService = async (payload) => {
  const result = createTournamentSchema.safeParse(payload);
  if (!result.success) {
    const errorMsg = result.error.issues.map((e) => e.message).join(' ');
    throw new ValidationError(errorMsg);
  }

  const data = result.data;
  const tourneyId = crypto.randomUUID();
  const now = new Date().toISOString();

  const newTournament = {
    id: tourneyId,
    name: data.name,
    location: data.location,
    startDate: data.startDate ?? null,
    endDate: data.endDate ?? null,
    maxTeams: data.maxTeams,
    status: 'UPCOMING',
    createdAt: now,
    updatedAt: now,
  };

  await insertTournament(newTournament);
  return newTournament;
};

export const getTournamentService = async (tourneyId) => {
  if (!tourneyId || typeof tourneyId !== 'string' || tourneyId.trim() === '') {
    throw new ValidationError('A valid Tournament ID is required.');
  }
  return await getSingleTournament(tourneyId.trim());
};

export const getAllTournamentsService = async () => {
  return await getAllTournaments();
};

export const registerTeamForTournamentService = async (tourneyId, payload) => {
  if (!tourneyId || typeof tourneyId !== 'string' || tourneyId.trim() === '') {
    throw new ValidationError('A valid Tournament ID is required.');
  }

  const result = registerTeamSchema.safeParse(payload);
  if (!result.success) {
    const errorMsg = result.error.issues.map((e) => e.message).join(' ');
    throw new ValidationError(errorMsg);
  }

  const tourney = await getSingleTournament(tourneyId.trim());
  if (!tourney) {
    throw new ValidationError(`Tournament with ID ${tourneyId} does not exist.`);
  }

  const data = result.data;
  const team = await getTeamInfo(data.teamId);
  if (!team) {
    throw new ValidationError(`Team with ID ${data.teamId} does not exist.`);
  }

  const regData = {
    division: data.division,
    teamName: team.name,
    registeredAt: new Date().toISOString(),
  };

  try {
    return await registerTeamForTournament(tourneyId.trim(), data.teamId, regData);
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw new ValidationError('This team is already registered for this tournament.');
    }
    throw error;
  }
};

export const getTeamsInTournamentService = async (tourneyId) => {
  if (!tourneyId || typeof tourneyId !== 'string' || tourneyId.trim() === '') {
    throw new ValidationError('A valid Tournament ID is required.');
  }
  return await getTeamsInTournament(tourneyId.trim());
};
