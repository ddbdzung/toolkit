import { MongoClient as v3 } from 'mongodb-v3';
import { MongoClient as v4 } from 'mongodb-v4';
import { MongoClient as v5 } from 'mongodb-v5';
import { MongoClient as v6 } from 'mongodb-v6';

import { MongodbConfiguration } from '../mongodb-configuration.builder';
import { IMetadataInstance } from './IMetadataInstance';

export interface IMongodbService {
  clients: Map<string, any>;
  metadata: Map<string, IMetadataInstance>;

  getClient(alias: string): v3 | v4 | v5 | v6;
  getMetadata(alias: string): IMetadataInstance;
  createClient(configuration: MongodbConfiguration): void;
  connect(alias: string): Promise<void>;
  disconnect(alias: string): Promise<void>;
  getDatabase(alias: string, databaseName: string): any;
}
