import { TrianglesClassificationEnum } from '../models/triangles-classification.enum';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../services/logger';
import { DatabaseError } from '../models/errors/database-error';

export interface TriangleDocument {
  id: string;
  sides: number[];
  type: TrianglesClassificationEnum;
  user: string;
}

export interface HistoryResult {
  lastIdFound?: string;
  history: TriangleDocument[];
}

export class TrianglesRepository {
  private ddb: DynamoDB.DocumentClient;
  private tableName: string;
  constructor(tableName: string) {
    this.ddb = new DynamoDB.DocumentClient({
      endpoint: process.env.DYNAMODB_ENDPOINT,
      sslEnabled: process.env.DYNAMODB_ENDPOINT ? false : true,
    });
    this.tableName = tableName;
  }
  async save(item: TriangleDocument): Promise<TriangleDocument> {
    try {
      logger.debug('putting new item');
      const newItem = {
        ...item,
        id: uuidv4(),
      };
      await this.ddb
        .put({
          Item: newItem,
          TableName: this.tableName,
        })
        .promise();
      return newItem;
    } catch (error) {
      logger.error('fail to put item', error);
      throw new DatabaseError();
    }
  }
  async getAll(limit?: number, lastId?: string): Promise<HistoryResult> {
    try {
      const params = {
        TableName: this.tableName,
      } as DynamoDB.DocumentClient.ScanInput;
      if (limit) {
        logger.debug('some limit has been set', limit);
        params.Limit = limit;
      }
      if (lastId) {
        logger.debug('the last id has been set', lastId);
        params.ExclusiveStartKey = {
          id: lastId,
        };
      }
      const scan = await this.ddb.scan(params).promise();
      if (!scan.Items) {
        logger.debug('nothing found');
        return {
          history: [],
        };
      }
      const history = scan.Items.map((item) => {
        return {
          id: item.id,
          sides: item.sides,
          type: item.type,
          user: item.user,
        } as TriangleDocument;
      });
      logger.debug(
        `was found ${history.length} items and this is${
          scan.LastEvaluatedKey ? ' not' : ''
        } the last page`
      );
      logger.debug(
        `${scan.LastEvaluatedKey ? 'last id found' : 'no last id'}`,
        scan.LastEvaluatedKey?.id
      );
      return {
        history,
        lastIdFound: scan.LastEvaluatedKey?.id,
      } as HistoryResult;
    } catch (error) {
      logger.error('fail to scan database', error);
      throw new DatabaseError();
    }
  }
}
