import config from 'config';

describe('Triangles Functional Tests', () => {
  describe('Given some user wants to classify his triangle', () => {
    test('When they make a request to api endpoint classification without access-token', async () => {
      const responseClassification = await global.testRequest
        .post('/triangles/classification')
        .send({
          sides: [1, 1, 1],
        });

      // Then he got a 403 error
      expect(responseClassification.status).toBe(403);
      expect(responseClassification.body).toEqual(
        expect.objectContaining({
          code: 403,
          error: 'Forbidden',
          message: 'x-access-token must be provided',
        })
      );
    });
    test('When they make a request to api endpoint classification with expired access-token', async () => {
      const responseClassification = await global.testRequest
        .post('/triangles/classification')
        .set(
          'x-access-token',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJERUZBVUxUX1VTRVIiLCJpYXQiOjE2NDA4MzUwMjksImV4cCI6MTY0MDgzODYyOX0.pgLRTzfpCV9HjkvNG7TRvZnhV9sgxMgJ7Kalqe9-i20'
        )
        .send({
          sides: [1, 1, 1],
        });

      // Then he got a 403 error
      expect(responseClassification.status).toBe(403);
      expect(responseClassification.body).toEqual(
        expect.objectContaining({
          code: 403,
          error: 'Forbidden',
          message: 'x-access-token expired',
        })
      );
    });
    test('When they make a request to api endpoint classification with invalid access-token', async () => {
      const responseClassification = await global.testRequest
        .post('/triangles/classification')
        .set(
          'x-access-token',
          'EyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJERUZBVUxUX1VTRVIiLCJpYXQiOjE2NDA4MzUwMjksImV4cCI6MTY0MDgzODYyOX0.pgLRTzfpCV9HjkvNG7TRvZnhV9sgxMgJ7Kalqe9-i20'
        )
        .send({
          sides: [1, 1, 1],
        });

      // Then he got a 403 error
      expect(responseClassification.status).toBe(403);
      expect(responseClassification.body).toEqual(
        expect.objectContaining({
          code: 403,
          error: 'Forbidden',
          message: 'invalid token',
        })
      );
    });
    test('When they make a request to api endpoint classification with malformed access-token', async () => {
      const responseClassification = await global.testRequest
        .post('/triangles/classification')
        .set('x-access-token', 'INVALID')
        .send({
          sides: [1, 1, 1],
        });

      // Then he got a 403 error
      expect(responseClassification.status).toBe(403);
      expect(responseClassification.body).toEqual(
        expect.objectContaining({
          code: 403,
          error: 'Forbidden',
          message: 'x-access-token malformed',
        })
      );
    });
    test('When they make a request to api endpoint classification', async () => {
      const responseToken = await global.testRequest.post('/auth/token').send({
        username: 'DEFAULT_USER',
        password: '12345',
      });

      expect(responseToken.status).toBe(200);
      expect(responseToken.body).toEqual(
        expect.objectContaining({
          ...{ 'x-access-token': expect.any(String) },
        })
      );

      const responseClassification = await global.testRequest
        .post('/triangles/classification')
        .set('x-access-token', responseToken.body['x-access-token'])
        .send({
          sides: [1, 1, 1],
        });

      // Then he got the type of a triangle
      expect(responseClassification.status).toBe(200);
      expect(responseClassification.body).toEqual(
        expect.objectContaining({
          type: 'EQUILATERAL',
          message: 'We are keeping registry on that',
        })
      );
    });
    test('When they make a request to api endpoint history', async () => {
      const responseToken = await global.testRequest.post('/auth/token').send({
        username: 'DEFAULT_USER',
        password: '12345',
      });

      expect(responseToken.status).toBe(200);
      expect(responseToken.body).toEqual(
        expect.objectContaining({
          ...{ 'x-access-token': expect.any(String) },
        })
      );

      // recreate table to clean items
      await global.db
        .deleteTable({
          TableName: config.get('dynamoDb.triangleTableName'),
        })
        .promise();
      await global.db
        .createTable({
          TableName: config.get('dynamoDb.triangleTableName'),
          KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
          AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
          ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
        })
        .promise();

      const responseClassification = await global.testRequest
        .post('/triangles/classification')
        .set('x-access-token', responseToken.body['x-access-token'])
        .send({
          sides: [1, 1, 1],
        });

      expect(responseClassification.status).toBe(200);
      expect(responseClassification.body).toEqual(
        expect.objectContaining({
          type: 'EQUILATERAL',
          message: 'We are keeping registry on that',
        })
      );

      const responseHistory = await global.testRequest
        .get('/triangles/history')
        .set('x-access-token', responseToken.body['x-access-token'])
        .send();

      // Then he got the last classifications made
      expect(responseHistory.status).toBe(200);
      expect(responseHistory.body).toEqual(
        expect.objectContaining({
          history: expect.any(Array),
        })
      );
      expect(responseHistory.body.history.length).toBe(1);
      expect(responseHistory.body.history[0]).toEqual(
        expect.objectContaining({
          ...{
            sides: [1, 1, 1],
            type: 'EQUILATERAL',
            user: 'DEFAULT_USER',
          },
          ...{ id: expect.any(String) },
        })
      );
    });
    test('When they make a request to api endpoint history, with multiple items', async () => {
      const responseToken = await global.testRequest.post('/auth/token').send({
        username: 'DEFAULT_USER',
        password: '12345',
      });

      expect(responseToken.status).toBe(200);
      expect(responseToken.body).toEqual(
        expect.objectContaining({
          ...{ 'x-access-token': expect.any(String) },
        })
      );

      // recreate table to clean items
      await global.db
        .deleteTable({
          TableName: config.get('dynamoDb.triangleTableName'),
        })
        .promise();
      await global.db
        .createTable({
          TableName: config.get('dynamoDb.triangleTableName'),
          KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
          AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
          ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
        })
        .promise();

      await global.db
        .putItem({
          Item: {
            id: {
              S: '1',
            },
            sides: {
              L: [
                {
                  N: '1',
                },
                {
                  N: '2',
                },
                {
                  N: '3',
                },
              ],
            },
            type: {
              S: 'SCALENE',
            },
            user: {
              S: 'DEFAULT_USER',
            },
          },
          TableName: config.get('dynamoDb.triangleTableName'),
        })
        .promise();
      await global.db
        .putItem({
          Item: {
            id: {
              S: '2',
            },
            sides: {
              L: [
                {
                  N: '1',
                },
                {
                  N: '1',
                },
                {
                  N: '1',
                },
              ],
            },
            type: {
              S: 'EQUILATERAL',
            },
            user: {
              S: 'DEFAULT_USER',
            },
          },
          TableName: config.get('dynamoDb.triangleTableName'),
        })
        .promise();

      const responseHistory = await global.testRequest
        .get('/triangles/history')
        .set('x-access-token', responseToken.body['x-access-token'])
        .send();

      // Then he got the last classifications made
      expect(responseHistory.status).toBe(200);
      expect(responseHistory.body).toEqual(
        expect.objectContaining({
          history: expect.any(Array),
        })
      );
      expect(responseHistory.body.history.length).toBe(2);
      expect(responseHistory.body.history[0]).toEqual(
        expect.objectContaining({
          id: '1',
          sides: [1, 2, 3],
          type: 'SCALENE',
          user: 'DEFAULT_USER',
        })
      );
      expect(responseHistory.body.history[1]).toEqual(
        expect.objectContaining({
          id: '2',
          sides: [1, 1, 1],
          type: 'EQUILATERAL',
          user: 'DEFAULT_USER',
        })
      );
    });
    test('When they make a request to api endpoint history with limit', async () => {
      const responseToken = await global.testRequest.post('/auth/token').send({
        username: 'DEFAULT_USER',
        password: '12345',
      });

      expect(responseToken.status).toBe(200);
      expect(responseToken.body).toEqual(
        expect.objectContaining({
          ...{ 'x-access-token': expect.any(String) },
        })
      );

      // recreate table to clean items
      await global.db
        .deleteTable({
          TableName: config.get('dynamoDb.triangleTableName'),
        })
        .promise();
      await global.db
        .createTable({
          TableName: config.get('dynamoDb.triangleTableName'),
          KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
          AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
          ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
        })
        .promise();

      await global.db
        .putItem({
          Item: {
            id: {
              S: '1',
            },
            sides: {
              L: [
                {
                  N: '1',
                },
                {
                  N: '2',
                },
                {
                  N: '3',
                },
              ],
            },
            type: {
              S: 'SCALENE',
            },
            user: {
              S: 'DEFAULT_USER',
            },
          },
          TableName: config.get('dynamoDb.triangleTableName'),
        })
        .promise();
      await global.db
        .putItem({
          Item: {
            id: {
              S: '2',
            },
            sides: {
              L: [
                {
                  N: '1',
                },
                {
                  N: '1',
                },
                {
                  N: '1',
                },
              ],
            },
            type: {
              S: 'EQUILATERAL',
            },
            user: {
              S: 'DEFAULT_USER',
            },
          },
          TableName: config.get('dynamoDb.triangleTableName'),
        })
        .promise();

      const responseHistory = await global.testRequest
        .get('/triangles/history')
        .set('x-access-token', responseToken.body['x-access-token'])
        .query({ limit: 1 })
        .send();

      // Then he got the last classifications made
      expect(responseHistory.status).toBe(200);
      expect(responseHistory.body).toEqual(
        expect.objectContaining({
          history: expect.any(Array),
          lastIdFound: expect.any(String),
        })
      );
      expect(responseHistory.body.history.length).toBe(1);
      expect(responseHistory.body.history[0]).toEqual(
        expect.objectContaining({
          id: '1',
          sides: [1, 2, 3],
          type: 'SCALENE',
          user: 'DEFAULT_USER',
        })
      );
    });
  });
});
