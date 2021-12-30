import { SetupServer } from '../src/server';
import config from 'config';
import supertest from 'supertest';
import { DynamoDB } from 'aws-sdk';
import DynamoDbLocal from 'dynamodb-local';

let server: SetupServer;
let dynamoEndpoint: string;
let dynamoPort: number;
let triangleTableName: string;
// let db: DynamoDB;

beforeAll(async () => {
  // setting server
  server = new SetupServer(config.get('apiPort'));
  await server.init();
  global.testRequest = supertest(server.getApp());

  // settting dynamo
  dynamoEndpoint = config.get('dynamoDb.endpoint');
  dynamoPort = config.get('dynamoDb.port');
  triangleTableName = config.get('dynamoDb.triangleTableName');

  DynamoDbLocal.configureInstaller({
    installPath: './dynamodblocal-bin',
    downloadUrl:
      'https://s3.sa-east-1.amazonaws.com/dynamodb-local-sao-paulo/dynamodb_local_latest.tar.gz',
  });

  await DynamoDbLocal.launch(dynamoPort, null, ['-inMemory'], false, true);
  try {
    global.db = new DynamoDB({
      endpoint: `${dynamoEndpoint}:${dynamoPort}`,
      sslEnabled: config.get('dynamoDb.sslEnabled'),
      region: config.get('dynamoDb.region'),
    });
  } catch (error) {
    DynamoDbLocal.stop(dynamoPort);
    throw error;
  }
});

beforeEach(async () => {
  try {
    await global.db
      .deleteTable({
        TableName: triangleTableName,
      })
      .promise();
  } catch (error: any) {
    if (error?.code !== 'ResourceNotFoundException') {
      throw error;
    }
  }
  try {
    await global.db
      .createTable({
        TableName: triangleTableName,
        KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
        ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
      })
      .promise();
  } catch (error) {
    DynamoDbLocal.stop(dynamoPort);
    throw error;
  }
});

afterAll(async () => {
  // stopping server
  await server.close();
  // stopping dynamo
  DynamoDbLocal.stop(dynamoPort);
});
