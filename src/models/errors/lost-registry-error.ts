export class LostRegistryError extends Error {
  constructor() {
    super('Ops, I could not keep track on that');
  }
}
