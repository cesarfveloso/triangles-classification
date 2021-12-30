import jwt from 'jsonwebtoken';
import { UserNotAuthorized } from '../models/errors/user-not-authorized-error';
import config from 'config';

export interface JwtToken {
  sub: string;
}

export default class AuthService {
  public static async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    if (!(password === hashedPassword)) {
      throw new UserNotAuthorized();
    }
    return true;
  }

  public static generateToken(sub: string): string {
    return jwt.sign({ sub }, config.get('auth.secretKey'), {
      expiresIn: config.get('auth.tokenExpiration'),
    });
  }

  public static decodeToken(token: string): JwtToken {
    return jwt.verify(token, config.get('auth.secretKey')) as JwtToken;
  }
}
