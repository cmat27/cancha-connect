/**
 * Centralized Key Builder for DynamoDB Single-Table Design.
 * Ensures consistent Partition Keys (PK), Sort Keys (SK), and GSI Keys across the app.
 */
export const KeyBuilder = {
  // 1. Core Entities
  Team: (teamId) => ({
    PK: `TEAM#${teamId}`,
    SK: `METADATA`,
  }),

  Player: (playerId) => ({
    PK: `PLAYER#${playerId}`,
    SK: `METADATA`,
  }),

  Tournament: (tourneyId) => ({
    PK: `TOURNAMENT#${tourneyId}`,
    SK: `METADATA`,
  }),

  // 2. Relational Mapping Items (Requires GSI Keys)
  Roster: (teamId, playerId) => ({
    PK: `TEAM#${teamId}`,
    SK: `PLAYER#${playerId}`,
    GSI1PK: `PLAYER#${playerId}`,
    GSI1SK: `TEAM#${teamId}`,
  }),

  Registration: (tourneyId, teamId) => ({
    PK: `TOURNAMENT#${tourneyId}`,
    SK: `TEAM#${teamId}`,
    GSI1PK: `TEAM#${teamId}`,
    GSI1SK: `TOURNAMENT#${tourneyId}`,
  }),
};
