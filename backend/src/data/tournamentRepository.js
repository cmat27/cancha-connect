import {
  PutCommand,
  GetCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { KeyBuilder } from '../utils/KeyBuilderUtility.js';
import { docClient } from './dbClient.js';

const TABLE_NAME = process.env.TABLE_NAME || 'CanchaConnectData';

/**
 * Inserts a new tournament into DynamoDB.
 */
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

/**
 * Retrieves a single tournament by ID.
 */
export const getSingleTournament = async (tourneyId) => {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: KeyBuilder.Tournament(tourneyId),
  });

  try {
    const response = await docClient.send(command);
    return response.Item;
  } catch (error) {
    console.error(`Error retrieving tournament ${tourneyId}:`, error);
    throw error;
  }
};

/**
 * Retrieves all tournaments using GSI1 Query.
 */
export const getAllTournaments = async () => {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :gsi1pk',
    ExpressionAttributeValues: {
      ':gsi1pk': 'TOURNAMENT',
    },
  });

  try {
    const response = await docClient.send(command);
    return response.Items || [];
  } catch (error) {
    console.error('Error retrieving all tournaments:', error);
    throw error;
  }
};

/**
 * Registers a team for a tournament.
 */
export const registerTeamForTournament = async (tournamentId, teamId, registrationData) => {
  const keys = KeyBuilder.Registration(tournamentId, teamId);
  const item = { ...keys, ...registrationData };

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
    ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
  });

  await docClient.send(command);
  return item;
};

/**
 * Retrieves all teams registered in a tournament.
 */
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
