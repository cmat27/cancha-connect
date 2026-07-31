/**
 * Centralized Key Builder for DynamoDB Single-Table Design.
 * Ensures consistent Partition Keys (PK), Sort Keys (SK), and GSI Keys across the app.
 */
export const KeyBuilder = {
  // 1. Core Entities (Using GSI1 for Sparse Global Indexing of Entity Lists)
  Team: (teamId) => ({
    PK: `TEAM#${teamId}`,
    SK: `METADATA`,
    GSI1PK: `TEAM`,
    GSI1SK: `TEAM#${teamId}`,
  }),

  Player: (playerId) => ({
    PK: `PLAYER#${playerId}`,
    SK: `METADATA`,
    GSI1PK: `PLAYER`,
    GSI1SK: `PLAYER#${playerId}`,
  }),

  Tournament: (tourneyId) => ({
    PK: `TOURNAMENT#${tourneyId}`,
    SK: `METADATA`,
    GSI1PK: `TOURNAMENT`,
    GSI1SK: `TOURNAMENT#${tourneyId}`,
  }),

  // 2. Relational Mapping Items (Requires Reverse Index Keys)
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

