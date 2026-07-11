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

export const insterPlayer = () => {};

export const getSinglePlayer = () => {};

export const getAllPlayers = () => {};
