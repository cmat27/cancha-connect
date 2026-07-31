import {
  PutCommand,
  GetCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { KeyBuilder } from '../utils/KeyBuilderUtility.js';
import { docClient } from './dbClient.js';

const TABLE_NAME = process.env.TABLE_NAME || 'CanchaConnectData';

/**
 * Inserts a new player into DynamoDB.
 */
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

/**
 * Retrieves a single player by ID.
 */
export const getSinglePlayer = async (playerId) => {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: KeyBuilder.Player(playerId),
  });

  try {
    const response = await docClient.send(command);
    return response.Item;
  } catch (error) {
    console.error(`Error retrieving player ${playerId}:`, error);
    throw error;
  }
};

/**
 * Retrieves all players using GSI1 Query.
 */
export const getAllPlayers = async () => {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :gsi1pk',
    ExpressionAttributeValues: {
      ':gsi1pk': 'PLAYER',
    },
  });

  try {
    const response = await docClient.send(command);
    return response.Items || [];
  } catch (error) {
    console.error('Error retrieving all players:', error);
    throw error;
  }
};

/**
 * Retrieves all teams a player is assigned to.
 */
export const getTeamsForPlayer = async (playerId) => {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :gsiPk AND begins_with(GSI1SK, :gsiSkPrefix)',
    ExpressionAttributeValues: {
      ':gsiPk': `PLAYER#${playerId}`,
      ':gsiSkPrefix': 'TEAM#',
    },
  });

  const response = await docClient.send(command);
  return response.Items || [];
};
