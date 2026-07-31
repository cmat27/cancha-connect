import {
  PutCommand,
  GetCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { KeyBuilder } from '../utils/KeyBuilderUtility.js';
import { docClient } from './dbClient.js';

const TABLE_NAME = process.env.TABLE_NAME || 'CanchaConnectData';

/**
 * Inserts a new team into the single-table DynamoDB design.
 */
export const insertTeam = async (teamData) => {
  const keys = KeyBuilder.Team(teamData.id);
  const item = {
    ...keys,
    ...teamData,
  };

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
    ConditionExpression: 'attribute_not_exists(PK)',
  });

  await docClient.send(command);
  return item;
};

/**
 * Retrieves a single team by ID.
 */
export const getTeamInfo = async (teamId) => {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: KeyBuilder.Team(teamId),
  });

  try {
    const response = await docClient.send(command);
    return response.Item;
  } catch (error) {
    console.error(`Error retrieving team ${teamId}:`, error);
    throw error;
  }
};

/**
 * Retrieves all teams using Global Secondary Index (GSI1) Query instead of table Scan.
 */
export const getAllTeams = async () => {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :gsi1pk',
    ExpressionAttributeValues: {
      ':gsi1pk': 'TEAM',
    },
  });

  try {
    const response = await docClient.send(command);
    return response.Items || [];
  } catch (error) {
    console.error('Error retrieving all teams:', error);
    throw error;
  }
};

/**
 * Adds a player to a team roster.
 */
export const addPlayerToTeam = async (teamId, playerId, rosterData) => {
  const keys = KeyBuilder.Roster(teamId, playerId);
  const item = { ...keys, ...rosterData };

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
    ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
  });

  await docClient.send(command);
  return item;
};

/**
 * Retrieves all players on a given team's roster.
 */
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

/**
 * Retrieves all tournaments a team is registered for.
 */
export const getTournamentsForTeam = async (teamId) => {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :gsiPk AND begins_with(GSI1SK, :gsiSkPrefix)',
    ExpressionAttributeValues: {
      ':gsiPk': `TEAM#${teamId}`,
      ':gsiSkPrefix': 'TOURNAMENT#',
    },
  });

  const response = await docClient.send(command);
  return response.Items || [];
};
