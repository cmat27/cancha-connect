import {
  PutCommand,
  GetCommand,
  ScanCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { KeyBuilder } from '../utils/KeyBuilderUtility.js';
import { docClient } from './dbClient.js';

// This pulls the table name from our environment variables (set in CloudFormation)
// When running locally without env vars, it falls back to 'CanchaConnectData'
const TABLE_NAME = process.env.TABLE_NAME || 'CanchaConnectData';

/**
 * Inserts a new team into the single-table DynamoDB design.
 */
export const insertTeam = async (teamData) => {
  // generate team key
  const keys = KeyBuilder.Team(teamData.id);
  // keys is now: { PK: "TEAM#1234-abcd", SK: "METADATA" }
  const item = {
    ...keys,
    ...teamData, // This spreads the rest of the data in!
  };

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
    // Condition ensures we don't accidentally overwrite an existing team ID
    ConditionExpression: 'attribute_not_exists(PK)',
  });

  await docClient.send(command);
  return item;
};

export const getTeamInfo = async (teamId) => {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: KeyBuilder.Team(teamId),
  });

  try {
    const response = await docClient.send(command);
    return response.Item; // Returns the team object, or undefined if not found
  } catch (error) {
    console.error(`Error retrieving team ${teamId}:`, error);
    throw error; // See note below on error handling!
  }
};

export const getAllTeams = async () => {
  const command = new ScanCommand({
    TableName: TABLE_NAME,
    // Filter to only grab main Team records, ignoring players/other data
    FilterExpression: 'begins_with(PK, :pkPrefix) AND SK = :skValue',
    ExpressionAttributeValues: {
      ':pkPrefix': 'TEAM#',
      ':skValue': 'METADATA',
    },
  });

  try {
    const response = await docClient.send(command);
    console.log(`Retrieved ${response.Items.length} teams.`);

    // Notice it's 'Items' (plural) for a Scan, not 'Item'

    console.log(response.Items);
    return response.Items;
  } catch (error) {
    console.error('Error retrieving all teams:', error);
    throw error; // Always throw so the router catches the 500 error!
  }
};

export const insertPlayer = async (playerData) => {
  const keys = KeyBuilder.Player(playerData.id);
  const item = { ...keys, ...playerData };

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
    ConditionExpression: 'attribute_not_exists(PK)',
  });

  await docClient.send(command);
  return item;
};

export const insertTournament = async (tournamentData) => {
  const keys = KeyBuilder.Tournament(tournamentData.id);
  const item = { ...keys, ...tournamentData };

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
    ConditionExpression: 'attribute_not_exists(PK)',
  });

  await docClient.send(command);
  return item;
};

// =====================================================================
// 2. RELATIONSHIPS (MANY-TO-MANY INSERTS)
// =====================================================================

export const addPlayerToTeam = async (teamId, playerId, rosterData) => {
  const keys = KeyBuilder.Roster(teamId, playerId);
  const item = { ...keys, ...rosterData };

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
    ConditionExpression:
      'attribute_not_exists(PK) AND attribute_not_exists(SK)',
  });

  await docClient.send(command);
  return item;
};

export const registerTeamForTournament = async (
  tournamentId,
  teamId,
  registrationData,
) => {
  const keys = KeyBuilder.Registration(tournamentId, teamId);
  const item = { ...keys, ...registrationData };

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
    ConditionExpression:
      'attribute_not_exists(PK) AND attribute_not_exists(SK)',
  });

  await docClient.send(command);
  return item;
};

// =====================================================================
// 3. ADVANCED ACCESS PATTERNS (QUERIES & GSI)
// =====================================================================

export const getPlayersOnTeam = async (teamId) => {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    ExpressionAttributeValues: {
      ':pk': `TEAM#${teamId}`,
      ':skPrefix': 'PLAYER#',
    },
  });

  const response = await docClient.send(command);
  return response.Items || [];
};

export const getTeamsForPlayer = async (playerId) => {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1', // Looking at our reverse index
    KeyConditionExpression:
      'GSI1PK = :gsiPk AND begins_with(GSI1SK, :gsiSkPrefix)',
    ExpressionAttributeValues: {
      ':gsiPk': `PLAYER#${playerId}`,
      ':gsiSkPrefix': 'TEAM#',
    },
  });

  const response = await docClient.send(command);
  return response.Items || [];
};

export const getTeamsInTournament = async (tournamentId) => {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    ExpressionAttributeValues: {
      ':pk': `TOURNAMENT#${tournamentId}`,
      ':skPrefix': 'TEAM#',
    },
  });

  const response = await docClient.send(command);
  return response.Items || [];
};

export const getTournamentsForTeam = async (teamId) => {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1', // Looking at our reverse index
    KeyConditionExpression:
      'GSI1PK = :gsiPk AND begins_with(GSI1SK, :gsiSkPrefix)',
    ExpressionAttributeValues: {
      ':gsiPk': `TEAM#${teamId}`,
      ':gsiSkPrefix': 'TOURNAMENT#',
    },
  });

  const response = await docClient.send(command);
  return response.Items || [];
};
