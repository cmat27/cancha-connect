import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createTeamService } from '../src/services/teamService.js';
import { createPlayerService } from '../src/services/playerService.js';
import { createTournamentService } from '../src/services/tournamentService.js';

describe('Validation Service Tests', () => {
  test('createTeamService fails on missing team name', async () => {
    await assert.rejects(
      async () => {
        await createTeamService({ coach: 'Coach Carter' });
      },
      (err) => {
        assert.equal(err.name, 'ValidationError');
        assert.match(err.message, /Team name is required/);
        return true;
      }
    );
  });

  test('createTeamService fails when team name exceeds 50 chars', async () => {
    await assert.rejects(
      async () => {
        await createTeamService({
          name: 'A'.repeat(51),
          coach: 'Coach Carter',
        });
      },
      (err) => {
        assert.equal(err.name, 'ValidationError');
        assert.match(err.message, /cannot exceed 50 characters/);
        return true;
      }
    );
  });

  test('createPlayerService fails on missing first name', async () => {
    await assert.rejects(
      async () => {
        await createPlayerService({ lastName: 'Messi' });
      },
      (err) => {
        assert.equal(err.name, 'ValidationError');
        assert.match(err.message, /First name is required/);
        return true;
      }
    );
  });

  test('createTournamentService fails on missing tournament name', async () => {
    await assert.rejects(
      async () => {
        await createTournamentService({ location: 'Stadium' });
      },
      (err) => {
        assert.equal(err.name, 'ValidationError');
        assert.match(err.message, /Tournament name is required/);
        return true;
      }
    );
  });
});
