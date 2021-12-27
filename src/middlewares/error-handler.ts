import { logger } from '../services/logger';
import { Request, Response, NextFunction } from 'express';
import ApiError from '../models/errors/api-error';

export interface HTTPError extends Error {
  status?: number;
}

export function errorHandler(
  error: HTTPError,
  _: Partial<Request>,
  res: Response,
  __: NextFunction
): void {
  logger.error(error); //@fix: some errors are not printed
  const errorCode = error.status || 500;
  res.status(errorCode).json(ApiError.format({ code: errorCode, message: error.message }));
}
