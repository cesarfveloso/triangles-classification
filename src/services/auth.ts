import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserNotAuthorized } from '../models/errors/user-not-authorized-error';
const privateKey = 'SECRET_KEY';

export interface JwtToken {
  sub: string;
}

export default class AuthService {
  public static async hashPassword(password: string, salt = 10): Promise<string> {
    return await bcrypt.hash(password, salt);
  }

  public static async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    // const match = await bcrypt.compare(password, hashedPassword);
    if (!(password === hashedPassword)) {
      throw new UserNotAuthorized();
    }
    return true;
  }

  public static generateToken(sub: string): string {
    return jwt.sign({ sub }, privateKey, {
      expiresIn: 3600,
    });
  }

  public static decodeToken(token: string): JwtToken {
    return jwt.verify(token, privateKey) as JwtToken;
  }
}
