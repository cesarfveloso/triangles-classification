import { Controller, Post } from '@overnightjs/core';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../services/logger';
import ApiError from '../models/errors/api-error';
import AuthService from '../services/auth';
import { UserService } from '../services/user';
import { UserNotAuthorized } from '../models/errors/user-not-authorized-error';

@Controller('auth')
export class AuthController {
  constructor(private userService: UserService) {}
  @Post('token')
  public async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.debug('looking for user', req.body.username);
      const user = this.userService.find(req.body.username);
      logger.debug('checking his password', req.body.username);
      await AuthService.comparePasswords(req.body.password, user.password);
      logger.debug('justing generating tolen', req.body.username);
      const token = AuthService.generateToken(user.username);
      res.status(StatusCodes.OK).json({ 'x-access-token': token });
    } catch (error) {
      if (error instanceof UserNotAuthorized) {
        logger.debug('user without access');
        res
          .status(StatusCodes.UNAUTHORIZED)
          .send(ApiError.format({ code: StatusCodes.UNAUTHORIZED, message: error.message }));
      } else {
        next(error);
      }
    }
  }
}
