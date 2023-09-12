import { MongodbConfiguration } from '../mongodb-configuration.builder';
import { IMetadataInstance } from './../interfaces/IMetadataInstance';
import { MongodbModuleException } from '../mongodb.exception';

type AliasClientName = string;

export default abstract class AbstractMongodbService<T> {
  protected _clients: Map<AliasClientName, T>;
  protected _metadata: Map<AliasClientName, IMetadataInstance>;

  protected constructor() {
    this._clients = new Map();
    this._metadata = new Map();
  }

  getMetadata(alias: AliasClientName): IMetadataInstance {
    if (!this._metadata.has(alias)) {
      throw new MongodbModuleException(`alias='${alias}' not instantiated`);
    }

    return this._metadata.get(alias);
  }

  getClient(alias: AliasClientName): T {
    if (!this._clients.has(alias) || !this._metadata.has(alias)) {
      throw new MongodbModuleException(`alias='${alias}' not instantiated`);
    }

    return this._clients.get(alias) as T;
  }

  abstract createClient(configuration: MongodbConfiguration): void;
  abstract connect(alias: AliasClientName): Promise<void>;
  abstract disconnect(alias: AliasClientName): Promise<void>;
  abstract getDatabase(alias: AliasClientName, databaseName: string): unknown;
}
