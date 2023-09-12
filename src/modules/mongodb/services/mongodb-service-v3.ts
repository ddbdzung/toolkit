import { MongoClient } from 'mongodb-v3';

import { MongodbDriverVersion, StatusClient } from './mongodb.enum';
import AbstractMongodbService from './mongodb-service.abstraction';
import { MongodbModuleException } from '../mongodb.exception';
import { MongodbConfiguration } from '../mongodb-configuration.builder';

type AliasClientName = string;

export default class MongodbServiceV3 extends AbstractMongodbService<MongoClient> {
  private static instance: MongodbServiceV3 = null;
  readonly driverVersion: MongodbDriverVersion;

  private constructor() {
    super();
    this.driverVersion = MongodbDriverVersion.V3;
  }

  static getInstance(): MongodbServiceV3 {
    if (MongodbServiceV3.instance === null) {
      MongodbServiceV3.instance = new MongodbServiceV3();
    }
    return MongodbServiceV3.instance;
  }

  createClient(configuration: MongodbConfiguration): void {
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
      version: this.driverVersion,
      uri: configuration.uri,
      options: configuration.options,
      status: StatusClient.PENDING,
    });
  }

  async connect(alias: AliasClientName) {
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

      metadata.status = StatusClient.CONNECTED;
      this._metadata.set(alias, metadata);
    } catch (error) {
      throw new MongodbModuleException(error);
    }
  }

  async disconnect(alias: AliasClientName) {
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

      metadata.status = StatusClient.DISCONNECTED;
      this._metadata.set(alias, metadata);
    } catch (error) {
      throw new MongodbModuleException(error);
    }
  }

  getDatabase(alias: AliasClientName, databaseName: string) {
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
