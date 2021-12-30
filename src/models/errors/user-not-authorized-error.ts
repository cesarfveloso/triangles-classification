export class UserNotAuthorized extends Error {
  constructor() {
    super('User/password does not match');
  }
}
