import crypto from 'crypto';
import { z } from 'zod';
import { ValidationError } from './teamService.js';
import {
  insertPlayer,
  getSinglePlayer,
  getAllPlayers,
  getTeamsForPlayer,
} from '../data/playerRepository.js';

const createPlayerSchema = z.object({
  firstName: z.string({ message: 'First name is required.' })
    .trim()
    .min(1, 'First name cannot be empty.')
    .max(50, 'First name cannot exceed 50 characters.'),
  lastName: z.string({ message: 'Last name is required.' })
    .trim()
    .min(1, 'Last name cannot be empty.')
    .max(50, 'Last name cannot exceed 50 characters.'),
  email: z.string().trim().email('Invalid email address.').optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  position: z.string().trim().optional().default('Unassigned'),
});

export const createPlayerService = async (payload) => {
  const result = createPlayerSchema.safeParse(payload);
  if (!result.success) {
    const errorMsg = result.error.issues.map((e) => e.message).join(' ');
    throw new ValidationError(errorMsg);
  }

  const data = result.data;
  const playerId = crypto.randomUUID();
  const now = new Date().toISOString();

  const newPlayer = {
    id: playerId,
    firstName: data.firstName,
    lastName: data.lastName,
    fullName: `${data.firstName} ${data.lastName}`,
    email: data.email ?? null,
    phone: data.phone ?? null,
    position: data.position,
    createdAt: now,
    updatedAt: now,
  };

  await insertPlayer(newPlayer);
  return newPlayer;
};

export const getPlayerService = async (playerId) => {
  if (!playerId || typeof playerId !== 'string' || playerId.trim() === '') {
    throw new ValidationError('A valid Player ID is required.');
  }
  return await getSinglePlayer(playerId.trim());
};

export const getAllPlayersService = async () => {
  return await getAllPlayers();
};

export const getTeamsForPlayerService = async (playerId) => {
  if (!playerId || typeof playerId !== 'string' || playerId.trim() === '') {
    throw new ValidationError('A valid Player ID is required.');
  }
  return await getTeamsForPlayer(playerId.trim());
};
