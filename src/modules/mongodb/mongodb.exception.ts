export class MongodbModuleException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MongodbModuleException';
  }
}
