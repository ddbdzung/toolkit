let instance: MongodbModule | null = null;

export class MongodbModule {
  static getInstance(): MongodbModule {
    if (!instance) {
      instance = new MongodbModule();
    }

    return instance;
  }
}

export class MongodbModuleException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MongodbModuleException';
  }
}
