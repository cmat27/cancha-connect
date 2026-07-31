import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  getUserContext,
  hasRole,
  isOrganizer,
  isCoach,
  isPlayer,
  isAdmin,
} from '../src/utils/authUtility.js';

describe('Auth Utility Tests', () => {
  test('getUserContext returns null when no claims are present', () => {
    const event = { requestContext: {} };
    const user = getUserContext(event);
    assert.equal(user, null);
  });

  test('getUserContext extracts sub, email, username, and groups correctly', () => {
    const event = {
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: 'user-uuid-1234',
              email: 'organizer@canchaconnect.com',
              'cognito:username': 'organizer1',
              'cognito:groups': ['Organizers'],
            },
          },
        },
      },
    };
    const user = getUserContext(event);
    assert.deepEqual(user, {
      userId: 'user-uuid-1234',
      email: 'organizer@canchaconnect.com',
      username: 'organizer1',
      groups: ['Organizers'],
    });
  });

  test('Role helpers correctly identify Organizers, Coaches, Players, and Admins', () => {
    const organizerUser = { userId: '1', groups: ['Organizers'] };
    const coachUser = { userId: '2', groups: ['Coaches'] };
    const playerUser = { userId: '3', groups: ['Players'] };
    const adminUser = { userId: '4', groups: ['Admins'] };

    assert.equal(isOrganizer(organizerUser), true);
    assert.equal(isCoach(organizerUser), false);

    assert.equal(isCoach(coachUser), true);
    assert.equal(isPlayer(coachUser), false);

    assert.equal(isPlayer(playerUser), true);
    assert.equal(isOrganizer(playerUser), false);

    // Admins bypass all role checks
    assert.equal(isAdmin(adminUser), true);
    assert.equal(isOrganizer(adminUser), true);
    assert.equal(isCoach(adminUser), true);
    assert.equal(isPlayer(adminUser), true);
  });
});
