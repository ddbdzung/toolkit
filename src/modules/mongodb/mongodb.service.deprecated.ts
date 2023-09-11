import { MongoClient as v3 } from 'mongodb-v3';
import { MongoClient as v4 } from 'mongodb-v4';
import { MongoClient as v5 } from 'mongodb-v5';
import { MongoClient as v6 } from 'mongodb-v6';

import { LoggerService } from '../logger/logger.service';
import { MongodbModuleException } from './mongodb.exception';
import { MongodbConfiguration } from './mongodb-configuration.builder';
import { StatusClient } from './interfaces/IMetadataInstance';

interface Metadata {
  version: number;
  status: StatusClient;
  options: Record<string, any>;
  uri: string;
}

export enum DriverVersions {
  v3 = 3,
  v4 = 4,
  v5 = 5,
  v6 = 6,
}

type AliasClientName = string;
type ClientVersions = typeof v3 | typeof v4 | typeof v5 | typeof v6;
type Clients = v3 | v4 | v5 | v6;

let rootInstance: MongodbService = null;
export class MongodbService {
  private _clientVersions: Map<number, ClientVersions>;
  private _clients: Map<AliasClientName, Clients>;
  private _metadata: Map<AliasClientName, Metadata>;
  private constructor() {
    this._clientVersions = new Map();
    this._clients = new Map();
    this._metadata = new Map();

    this._clientVersions.set(DriverVersions.v3, v3);
    this._clientVersions.set(DriverVersions.v4, v4);
    this._clientVersions.set(DriverVersions.v5, v5);
    this._clientVersions.set(DriverVersions.v6, v6);
  }

  static getInstance(): MongodbService {
    if (rootInstance === null) {
      rootInstance = new MongodbService();
      console.log('MongodbService instance created');
    }
    return rootInstance;
  }

  getClient(alias: string) {
    if (!this._clients.has(alias) || !this._metadata.has(alias)) {
      throw new MongodbModuleException(`alias='${alias}' not instantiated`);
    }

    return this._clients.get(alias);
  }

  getMetadata(alias: string) {
    if (!this._clients.has(alias) || !this._metadata.has(alias)) {
      throw new MongodbModuleException(`alias='${alias}' not instantiated`);
    }

    return this._metadata.get(alias);
  }

  async connect(alias: string) {
    const metadata = this._metadata.get(alias);
    const client = this._clients.get(alias);
    if (!metadata || !client) {
      throw new MongodbModuleException(`alias='${alias}' not instantiated`);
    }

    if (metadata.status === StatusClient.CONNECTED) {
      throw new MongodbModuleException(`alias='${alias}' already connected`);
    }

    try {
      await client.connect();
      LoggerService.info(MongodbService.name, `alias='${alias}' connected`);
    } catch (error) {
      throw new MongodbModuleException(error);
    }

    metadata.status = StatusClient.CONNECTED;
    this._metadata.set(alias, metadata);
  }

  createClient(version: DriverVersions, configuration: MongodbConfiguration) {
    if (
      this._clients.has(configuration.alias) ||
      this._metadata.has(configuration.alias)
    ) {
      throw new MongodbModuleException(
        `alias='${configuration.alias}' already instantiated`,
      );
    }

    const constructor = this._clientVersions.get(version);
    this._clients.set(
      configuration.alias,
      new constructor(configuration.uri, configuration.options),
    );
    this._metadata.set(configuration.alias, {
      version,
      uri: configuration.uri,
      options: configuration.options,
      status: StatusClient.PENDING,
    });
  }

  async disconnect(alias: string) {
    const metadata = this._metadata.get(alias);
    const client = this._clients.get(alias);
    if (!metadata || !client) {
      throw new MongodbModuleException(`alias='${alias}' not instantiated`);
    }

    if (metadata.status === StatusClient.PENDING) {
      throw new MongodbModuleException(
        `alias='${alias}' is pending. Disconnect failed`,
      );
    }

    if (metadata.status === StatusClient.DISCONNECTED) {
      throw new MongodbModuleException(`alias='${alias}' already disconnected`);
    }

    try {
      await client.close();
      LoggerService.info(MongodbService.name, `alias='${alias}' disconnected`);
    } catch (error) {
      throw new MongodbModuleException(error);
    }
    metadata.status = StatusClient.DISCONNECTED;
    this._metadata.set(alias, metadata);
  }

  getDatabase(alias: string, dbName: string) {
    const metadata = this._metadata.get(alias);
    const client = this._clients.get(alias);
    if (!metadata || !client) {
      throw new MongodbModuleException(`alias='${alias}' not instantiated`);
    }

    if (metadata.status !== StatusClient.CONNECTED) {
      throw new MongodbModuleException(`alias='${alias}' is not connected`);
    }

    return client.db(dbName);
  }
}
