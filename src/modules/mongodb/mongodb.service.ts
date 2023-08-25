import * as MongoDb from 'mongodb';
import { LoggerService } from '../logger/logger.service';
import { ClassBuilderPattern } from './mongodb.module';

const validIpAddressRegex =
  /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

const validHostnameRegex =
  /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]).)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/;

const isNumeric = number => {
  return !isNaN(parseFloat(number)) && isFinite(number);
};

class MongodbUri extends ClassBuilderPattern {
  private _mongodbUri: string;

  private _buildUriNoAccessCredential(builder: MongodbUriBuilder): string {
    return `mongodb://${builder.host}:${builder.port}`;
  }

  private _buildUriWithAccessCredential(builder: MongodbUriBuilder): string {
    return `mongodb://${builder.username}:${builder.password}@${builder.host}:${builder.port}`;
  }

  constructor(builder: MongodbUriBuilder) {
    super();
    if (builder.hasAccessCredentials) {
      this._mongodbUri = this._buildUriWithAccessCredential(builder);
    } else {
      this._mongodbUri = this._buildUriNoAccessCredential(builder);
    }
  }

  get mongodbUri(): string {
    return this._mongodbUri;
  }
}

export class MongodbUriBuilder {
  private _host: string;
  private _port: number;
  private _hasAccessCredentials: boolean;
  private _username: string;
  private _password: string;
  constructor() {
    this._host = '';
    this._port = 0;

    this._hasAccessCredentials = false;
    this._username = '';
    this._password = '';
  }

  get host(): string {
    return this._host;
  }
  get port(): number {
    return this._port;
  }
  get hasAccessCredentials(): boolean {
    return this._hasAccessCredentials;
  }
  get username(): string {
    return this._username;
  }
  get password(): string {
    return this._password;
  }

  public setHost(host: string): MongodbUriBuilder {
    if (!validIpAddressRegex.test(host) || !validHostnameRegex.test(host)) {
      throw new Error('Host must be a valid ip address or hostname');
    }

    this._host = host;
    return this;
  }

  public setPort(port: number): MongodbUriBuilder {
    if (!isNumeric(port)) {
      throw new Error('Port must be a number');
    }

    if (port < 0 || port > 65535) {
      throw new Error('Port must be between 0 and 65535');
    }

    this._port = port;
    return this;
  }

  public withAccessCredentials(
    username: string,
    password: string,
  ): MongodbUriBuilder {
    const specialCharacters = ['$', ':', '/', '?', '#', '[', ']', '@'];
    let formattedPassword = password;
    if (specialCharacters.some(char => password.includes(char))) {
      formattedPassword = encodeURIComponent(password);
    }

    this._hasAccessCredentials = true;
    this._username = username;
    this._password = formattedPassword;
    return this;
  }

  public build(): MongodbUri {
    if (!this._host) {
      throw new Error('Host required to build mongodb uri');
    }

    if (!this._port) {
      throw new Error('Port required to build mongodb uri');
    }

    if (this._hasAccessCredentials) {
      if (!this._username) {
        throw new Error('Username required to build mongodb uri');
      }

      if (!this._password) {
        throw new Error('Password required to build mongodb uri');
      }
    }

    return new MongodbUri(this);
  }
}

class MongodbConfig extends ClassBuilderPattern {
  private _uri: string;
  private _databaseName: string;
  constructor(builder: MongodbConfigBuilder) {
    super();
    this._uri = builder.uri;
    this._databaseName = builder.databaseName;
  }

  get uri(): string {
    return this._uri;
  }
  get databaseName(): string {
    return this._databaseName;
  }
}

export class MongodbConfigBuilder {
  private _uri: string;
  private _databaseName: string;

  constructor() {
    this._databaseName = '';
  }

  get uri(): string {
    return this._uri;
  }
  get databaseName(): string {
    return this._databaseName;
  }

  public setUri(uri: string): MongodbConfigBuilder {
    this._uri = uri;
    return this;
  }

  public setDatabaseName(databaseName: string): MongodbConfigBuilder {
    this._databaseName = databaseName;
    return this;
  }

  public build(): MongodbConfig {
    if (!this._uri) {
      throw new Error('Uri required to build mongodb config');
    }

    if (!this._databaseName) {
      throw new Error('Database name required to build mongodb config');
    }

    return new MongodbConfig(this);
  }
}

// TODO: How to create many client connecting to many databases?
// Using alias connection name, but how to create many alias connection name?
// And only use an array of instances without re-creating new instance?
class MongodbConfiguration extends ClassBuilderPattern {
  private readonly _uri: string;
  private readonly _alias: string;
  private readonly _options: MongoDb.MongoClientOptions;
  constructor(builder: MongodbConfigurationBuilder) {
    super();
    this._uri = builder.uri;
    this._alias = builder.alias;
    this._options = builder.options;
  }

  get uri(): string {
    return this._uri;
  }
  get alias(): string {
    return this._alias;
  }
  get options(): MongoDb.MongoClientOptions {
    return this._options;
  }
}

export class MongodbConfigurationBuilder {
  private _uri: string;
  private _alias: string;
  private _options: MongoDb.MongoClientOptions;
  constructor() {
    this._uri = '';
    this._alias = '';
    this._options = {};
  }

  get uri(): string {
    return this._uri;
  }
  get alias(): string {
    return this._alias;
  }
  get options(): MongoDb.MongoClientOptions {
    return this._options;
  }

  public setUri(uri: string): MongodbConfigurationBuilder {
    this._uri = uri;
    return this;
  }

  public setAlias(alias: string): MongodbConfigurationBuilder {
    this._alias = alias;
    return this;
  }

  public withOptions(
    options: MongoDb.MongoClientOptions,
  ): MongodbConfigurationBuilder {
    this._options = options;
    return this;
  }

  public build(): MongodbConfiguration {
    if (!this._uri) {
      throw new Error('Uri required to build mongodb configuration');
    }

    if (!this._alias) {
      throw new Error('Alias required to build mongodb configuration');
    }

    return new MongodbConfiguration(this);
  }
}
export type AliasConnName = string;
export enum StatusInstance {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  PENDING = 'pending',
}
export type MetadataInstance = {
  status: StatusInstance;
  options: MongoDb.MongoClientOptions;
};

export class MongodbService {
  private static _instances: Map<AliasConnName, MongoDb.MongoClient> =
    new Map();
  private static _metadata: Map<AliasConnName, MetadataInstance> = new Map();

  public static get metadata() {
    return MongodbService._metadata;
  }

  public static get instances() {
    return MongodbService._instances;
  }

  public static createInstance(configuration: MongodbConfiguration) {
    const { uri, alias, options } = configuration;
    const client: MongoDb.MongoClient = new MongoDb.MongoClient(uri, options);
    if (
      MongodbService._instances.has(alias) ||
      MongodbService._metadata.has(alias)
    ) {
      throw new Error(
        `Database uri='${uri}', alias='${alias}' already instantiated`,
      );
    }

    MongodbService._metadata.set(alias, {
      options,
      status: StatusInstance.PENDING,
    });
    MongodbService._instances.set(alias, client);

    LoggerService.info(
      MongodbService.name,
      `Database uri='${uri}', alias='${alias}' instantiated successfully`,
    );
  }

  public static async init(alias: AliasConnName) {
    if (
      !MongodbService._instances.has(alias) ||
      !MongodbService._metadata.has(alias)
    ) {
      throw new Error(
        `alias='${alias}' not instantiated. Call createInstance() first`,
      );
    }

    if (
      MongodbService._metadata.has(alias) &&
      MongodbService._metadata.get(alias).status === StatusInstance.CONNECTED
    ) {
      throw new Error(`alias='${alias}' already connected`);
    }

    try {
      await MongodbService._instances.get(alias).connect();

      const metadataInstance = MongodbService._metadata.get(alias);
      metadataInstance.status = StatusInstance.CONNECTED;
      MongodbService._metadata.set(alias, metadataInstance);

      LoggerService.info(
        `${MongodbService.name}`,
        `alias='${alias}' connected successfully`,
      );
    } catch (error) {
      LoggerService.error(
        `${MongodbService.name}`,
        `alias='${alias}' connected failed`,
      );
      throw new Error(error);
    }
  }

  public static getInstance(alias: AliasConnName): MongoDb.MongoClient;
  public static getInstance(
    alias: AliasConnName,
    databaseName: string,
  ): MongoDb.Db;

  public static getInstance(alias: AliasConnName): MongoDb.MongoClient {
    if (
      !MongodbService._instances.has(alias) ||
      !MongodbService._metadata.has(alias)
    ) {
      throw new Error(`alias='${alias}' not instantiated`);
    }

    return MongodbService._instances.get(alias);
  }

  public static getInstance(
    alias: AliasConnName,
    databaseName: string,
  ): MongoDb.Db {
    if (
      !MongodbService._instances.has(alias) ||
      !MongodbService._metadata.has(alias)
    ) {
      throw new Error(`alias='${alias}' not instantiated`);
    }

    return MongodbService._instances.get(alias).db(databaseName);
  }

  public static async disconnect(alias: string) {
    if (
      !MongodbService._instances.has(alias) ||
      !MongodbService._metadata.has(alias)
    ) {
      throw new Error(`alias='${alias}' not instantiated. Disconnect failed`);
    }

    if (
      MongodbService._metadata.get(alias).status === StatusInstance.DISCONNECTED
    ) {
      throw new Error(`alias='${alias}' already disconnected`);
    }

    if (MongodbService._metadata.get(alias).status === StatusInstance.PENDING) {
      throw new Error(`alias='${alias}' is pending. Disconnect failed`);
    }

    try {
      await MongodbService._instances.get(alias).close();
      const metadataInstance = MongodbService._metadata.get(alias);
      metadataInstance.status = StatusInstance.DISCONNECTED;
      MongodbService._metadata.set(alias, metadataInstance);

      LoggerService.info(
        `${MongodbService.name}`,
        `alias='${alias}' disconnected successfully`,
      );
    } catch (err) {
      LoggerService.error(
        `${MongodbService.name}`,
        `alias='${alias}' disconnected failed`,
      );
      throw new Error(err);
    }
  }
}
