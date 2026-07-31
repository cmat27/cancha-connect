import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { KeyBuilder } from '../src/utils/KeyBuilderUtility.js';

describe('KeyBuilderUtility Tests', () => {
  test('Team key builder generates correct PK, SK, and GSI keys', () => {
    const keys = KeyBuilder.Team('team-123');
    assert.deepEqual(keys, {
      PK: 'TEAM#team-123',
      SK: 'METADATA',
      GSI1PK: 'TEAM',
      GSI1SK: 'TEAM#team-123',
    });
  });

  test('Player key builder generates correct PK, SK, and GSI keys', () => {
    const keys = KeyBuilder.Player('player-456');
    assert.deepEqual(keys, {
      PK: 'PLAYER#player-456',
      SK: 'METADATA',
      GSI1PK: 'PLAYER',
      GSI1SK: 'PLAYER#player-456',
    });
  });

  test('Tournament key builder generates correct PK, SK, and GSI keys', () => {
    const keys = KeyBuilder.Tournament('tourney-789');
    assert.deepEqual(keys, {
      PK: 'TOURNAMENT#tourney-789',
      SK: 'METADATA',
      GSI1PK: 'TOURNAMENT',
      GSI1SK: 'TOURNAMENT#tourney-789',
    });
  });

  test('Roster key builder generates correct reverse index GSI keys', () => {
    const keys = KeyBuilder.Roster('team-123', 'player-456');
    assert.deepEqual(keys, {
      PK: 'TEAM#team-123',
      SK: 'PLAYER#player-456',
      GSI1PK: 'PLAYER#player-456',
      GSI1SK: 'TEAM#team-123',
    });
  });
});
