import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Initialize the standard AWS DynamoDB client
// In a local environment, you could also configure this to point to a local DynamoDB instance if needed.
const client = new DynamoDBClient({});

// The DocumentClient automatically translates normal JavaScript objects
// into DynamoDB's specialized data types (S, N, M, L, etc.)
const marshallOptions = {
  // Automatically remove undefined values instead of throwing an error
  removeUndefinedValues: true,
};

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions,
});
