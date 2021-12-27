import { Controller, Get, Post } from '@overnightjs/core';
import { Triangle } from '../models/triangle';
import { TrianglesService } from '../services/triangles';
import { validateOrReject, ValidationError } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../services/logger';
import ApiError from '../models/errors/api-error';
import { NotATriangleError } from '../models/errors/not-a-triangle-error';

@Controller('triangles')
export class TrianglesControlller {
  constructor(private trianglesService: TrianglesService) {}
  @Post('classification')
  public async classification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = 'DEFAULT_USER'; // @todo: implement get user by auth
      const triangle = new Triangle();
      triangle.sides = req.body.sides;
      logger.debug('validating body', req.body);
      await validateOrReject(triangle);
      logger.debug('starting classification');
      const type = this.trianglesService.classification(triangle);
      logger.debug('type obtained', type);
      const idCreated = await this.trianglesService.saveHistory(triangle, user, type);
      if (idCreated) {
        logger.info('some triangle has been classified', type, user);
        res.status(StatusCodes.OK).json({
          type,
          message: 'We are keeping registry on that',
        });
      } else {
        res.status(StatusCodes.OK).json({
          type,
          message: 'Ops, I could not keep track on that',
        });
      }
    } catch (error) {
      if (Array.isArray(error) && error.some((x) => x instanceof ValidationError)) {
        logger.debug('some validation error', error);
        // const validationMsg = error
        //   .filter((x) => x instanceof ValidationError)
        //   .reduce((acc, curr: ValidationError) => {
        //     acc.join(curr.constraints);
        //   }, []);
        // @todo: handle validation error
        res.status(StatusCodes.BAD_REQUEST).send(
          ApiError.format({
            code: StatusCodes.BAD_REQUEST,
            message: 'Must inform an array of number as sides',
          })
        );
      } else if (error instanceof NotATriangleError) {
        logger.debug('invalid triangle', error);
        res
          .status(StatusCodes.UNPROCESSABLE_ENTITY)
          .send(
            ApiError.format({ code: StatusCodes.UNPROCESSABLE_ENTITY, message: error.message })
          );
      } else {
        next(error);
      }
    }
  }

  @Get('history')
  public async history(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lastId = null, limit = 10 } = req.query;
      logger.debug('querying using these parameters', lastId, limit);
      const { history, lastIdFound } = await this.trianglesService.getHistory(
        parseInt(limit.toString()),
        lastId?.toString()
      );
      logger.debug(`a list of ${history.length} triangle(s) obtained`);
      res.status(StatusCodes.OK).json({ history, lastIdFound });
    } catch (error) {
      next(error);
    }
  }
}
