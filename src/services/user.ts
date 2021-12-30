import { UserNotAuthorized } from '../models/errors/user-not-authorized-error';

const users = [
  {
    username: 'DEFAULT_USER',
    password: '12345',
  },
];

export interface User {
  username: string;
  password: string;
}

export class UserService {
  find(username: string): User {
    const user = users.find((x) => x.username === username);
    if (!user) {
      throw new UserNotAuthorized();
    }
    return user;
  }
}
