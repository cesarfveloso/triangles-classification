export class NotATriangleError extends Error {
  constructor() {
    super('Given values do not represents a triangle');
  }
}
