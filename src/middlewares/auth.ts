import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { JsonWebTokenError } from 'jsonwebtoken';
import ApiError from '../models/errors/api-error';
import AuthService from '../services/auth';
import httpContext from 'express-http-context';

export function authMiddleware(
  req: Partial<Request>,
  res: Partial<Response>,
  next: NextFunction
): void {
  const token = req.headers?.['x-access-token'];
  try {
    const claims = AuthService.decodeToken(token as string);
    httpContext.set('userId', claims.sub);
    next();
  } catch (error: any) {
    if (error instanceof JsonWebTokenError) {
      if (error.message.search(/jwt must be provided/) >= 0) {
        error.message = error.message.replace(/jwt/, 'x-access-token');
      }
    }
    res.status?.(StatusCodes.FORBIDDEN).send(
      ApiError.format({
        code: StatusCodes.FORBIDDEN,
        message: error.message || 'Something went wrong with your authentication',
      })
    );
  }
}
