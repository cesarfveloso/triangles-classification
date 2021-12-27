import { TrianglesRepository } from './triangles';
import { TrianglesClassificationEnum } from '../models/triangles-classification.enum';
// import DynamoDbLocal from 'dynamodb-local';
// import { DynamoDB } from 'aws-sdk';

const tableName = 'TRIANGLE_TEST';
// const dynamoPort = 8000;
// let db: DynamoDB;

// beforeAll(async () => {
//   await DynamoDbLocal.launch(dynamoPort, null, ['-inMemory'], false, true);
//   db = new DynamoDB({
//     endpoint: `localhost:${dynamoPort}`,
//     sslEnabled: false,
//   });
// });

// beforeEach(async () => {
//   try {
//     await db
//       .deleteTable({
//         TableName: tableName,
//       })
//       .promise();
//   } catch (error: any) {
//     if (error?.code !== 'ResourceNotFoundException') {
//       throw error;
//     }
//   }
//   await db
//     .createTable({
//       TableName: tableName,
//       KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
//       AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
//       ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
//     })
//     .promise();
// });

// afterAll(async () => {
//   DynamoDbLocal.stop(dynamoPort);
// });

describe('Triangles Repository', () => {
  describe('triangle saving', () => {
    test('should insert item into table', async () => {
      const repository = new TrianglesRepository(tableName);
      const objToBeSaved = {
        id: 'ID',
        sides: [1, 2, 3],
        type: TrianglesClassificationEnum.EQUILATERAL,
        user: 'DEFAULT_USER',
      };
      const saved = await repository.save(objToBeSaved);
      expect(saved).toEqual(
        expect.objectContaining({
          ...objToBeSaved,
          ...{ id: expect.any(String) },
        })
      );
    }, 10000);
  });
  describe('triangle retrieving history', () => {
    test('should retrieve inserted item from table', async () => {
      const repository = new TrianglesRepository(tableName);
      const objToBeSaved = {
        id: 'ID',
        sides: [1, 2, 3],
        type: TrianglesClassificationEnum.EQUILATERAL,
        user: 'DEFAULT_USER',
      };
      await repository.save(objToBeSaved);
      const items = await repository.getAll();
      expect(Array.isArray(items.history)).toBe(true);
      expect(items.history).toContainEqual(
        expect.objectContaining({
          ...objToBeSaved,
          ...{ id: expect.any(String) },
        })
      );
    }, 10000);
    test('should retrieve multiple inserted item from table', async () => {
      const repository = new TrianglesRepository(tableName);
      const objToBeSaved1 = {
        id: 'ID',
        sides: [1, 2, 3],
        type: TrianglesClassificationEnum.EQUILATERAL,
        user: 'DEFAULT_USER',
      };
      const objToBeSaved2 = {
        id: 'ID',
        sides: [1, 2, 3],
        type: TrianglesClassificationEnum.EQUILATERAL,
        user: 'DEFAULT_USER',
      };
      await repository.save(objToBeSaved1);
      await repository.save(objToBeSaved2);
      const items = await repository.getAll();
      expect(Array.isArray(items.history)).toBe(true);
      expect(items.history).toContainEqual(
        expect.objectContaining({
          ...objToBeSaved1,
          ...{ id: expect.any(String) },
        })
      );
      expect(items.history).toContainEqual(
        expect.objectContaining({
          ...objToBeSaved2,
          ...{ id: expect.any(String) },
        })
      );
    }, 10000);
    test('should retrieve multiple inserted item from table, but limited', async () => {
      const repository = new TrianglesRepository(tableName);
      const objToBeSaved1 = {
        id: 'ID',
        sides: [1, 2, 3],
        type: TrianglesClassificationEnum.EQUILATERAL,
        user: 'DEFAULT_USER',
      };
      const objToBeSaved2 = {
        id: 'ID',
        sides: [1, 2, 3],
        type: TrianglesClassificationEnum.EQUILATERAL,
        user: 'DEFAULT_USER',
      };
      const { id: id1 } = await repository.save(objToBeSaved1);
      const { id: id2 } = await repository.save(objToBeSaved2);
      const items = await repository.getAll(1);
      expect(Array.isArray(items.history)).toBe(true);
      expect(items.history.length).toBe(1);
      expect(items.history).toContainEqual(
        expect.objectContaining({
          ...objToBeSaved1,
          ...{ id: expect.any(String) },
        })
      );
      const correctLastId = items.history[0].id === id1 ? id1 : id2;
      expect(items.lastIdFound).toBe(correctLastId);
    }, 10000);
    test('should retrieve multiple inserted item from table, from the last informed', async () => {
      const repository = new TrianglesRepository(tableName);
      const objToBeSaved1 = {
        id: 'ID',
        sides: [1, 2, 3],
        type: TrianglesClassificationEnum.EQUILATERAL,
        user: 'DEFAULT_USER',
      };
      const objToBeSaved2 = {
        id: 'ID',
        sides: [1, 2, 3],
        type: TrianglesClassificationEnum.EQUILATERAL,
        user: 'DEFAULT_USER',
      };
      const { id: id1 } = await repository.save(objToBeSaved1);
      const { id: id2 } = await repository.save(objToBeSaved2);
      const firstSearch = await repository.getAll(1);
      expect(Array.isArray(firstSearch.history)).toBe(true);
      expect(firstSearch.history.length).toBe(1);
      expect(firstSearch.history).toContainEqual(
        expect.objectContaining({
          ...objToBeSaved1,
          ...{ id: expect.any(String) },
        })
      );
      const correctLastId = firstSearch.history[0].id === id1 ? id1 : id2;
      expect(firstSearch.lastIdFound).toBe(correctLastId);
      const secondSearch = await repository.getAll(undefined, correctLastId);
      expect(Array.isArray(secondSearch.history)).toBe(true);
      expect(secondSearch.history.length).toBe(1);
      expect(secondSearch.history).toContainEqual(
        expect.objectContaining({
          ...objToBeSaved2,
          ...{ id: expect.any(String) },
        })
      );
      expect(secondSearch.lastIdFound).toBe(undefined);
    }, 10000);
  });
});
