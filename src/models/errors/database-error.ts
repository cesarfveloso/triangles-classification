export class DatabaseError extends Error {
  constructor() {
    super('Something went wrong when trying to read/write to database');
  }
}
