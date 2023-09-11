import { MongoClient } from 'mongodb-v6';

import { IMetadataInstance } from './../interfaces/IMetadataInstance';
import { IMongodbService } from '../interfaces/IMongodbService';
import { MongodbConfiguration } from '../mongodb-configuration.builder';
import { MongodbModuleException } from '../mongodb.exception';
import { MongodbDriverVersion } from './version.enum';

type AliasClientName = string;

enum StatusClient {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  PENDING = 'pending',
}

export default class MongodbServiceV6 implements IMongodbService {
  private _clients: Map<AliasClientName, MongoClient>;
  private _metadata: Map<AliasClientName, IMetadataInstance>;
  private static instance: MongodbServiceV6 = null;
  static driverVersion = MongodbDriverVersion.V6;

  get clients(): Map<AliasClientName, MongoClient> {
    return this._clients;
  }

  get metadata(): Map<AliasClientName, IMetadataInstance> {
    return this._metadata;
  }

  private constructor() {
    this._clients = new Map();
    this._metadata = new Map();
  }

  static getInstance(): MongodbServiceV6 {
    if (MongodbServiceV6.instance === null) {
      MongodbServiceV6.instance = new MongodbServiceV6();
    }
    return MongodbServiceV6.instance;
  }

  createClient(configuration: MongodbConfiguration) {
    if (
      this._clients.has(configuration.alias) ||
      this._metadata.has(configuration.alias)
    ) {
      throw new MongodbModuleException(
        `alias='${configuration.alias}' already instantiated`,
      );
    }

    this._clients.set(
      configuration.alias,
      new MongoClient(configuration.uri, configuration.options),
    );
    this._metadata.set(configuration.alias, {
      version: MongodbServiceV6.driverVersion,
      uri: configuration.uri,
      options: configuration.options,
      status: StatusClient.PENDING,
    });
  }

  getClient(alias: string): MongoClient {
    if (!this._clients.has(alias) || !this._metadata.has(alias)) {
      throw new MongodbModuleException(`alias='${alias}' not instantiated`);
    }

    return this._clients.get(alias);
  }

  getMetadata(alias: string): IMetadataInstance {
    if (!this._metadata.has(alias)) {
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
    } catch (error) {
      throw new MongodbModuleException(error);
    }

    metadata.status = StatusClient.CONNECTED;
    this._metadata.set(alias, metadata);
  }

  async disconnect(alias: string) {
    const metadata = this._metadata.get(alias);
    const client = this._clients.get(alias);
    if (!metadata || !client) {
      throw new MongodbModuleException(`alias='${alias}' not instantiated`);
    }

    if (metadata.status === StatusClient.DISCONNECTED) {
      throw new MongodbModuleException(`alias='${alias}' already disconnected`);
    }

    try {
      await client.close();
    } catch (error) {
      throw new MongodbModuleException(error);
    }

    metadata.status = StatusClient.DISCONNECTED;
    this._metadata.set(alias, metadata);
  }

  getDatabase(alias: string, databaseName: string) {
    const metadata = this._metadata.get(alias);
    const client = this._clients.get(alias);
    if (!metadata || !client) {
      throw new MongodbModuleException(`alias='${alias}' not instantiated`);
    }

    if (metadata.status !== StatusClient.CONNECTED) {
      throw new MongodbModuleException(`alias='${alias}' is not connected`);
    }

    return client.db(databaseName);
  }
}
