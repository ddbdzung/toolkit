import { MongoClient, MongoClientOptions } from 'mongodb';

const validIpAddressRegex =
  /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

const validHostnameRegex =
  /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]).)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/;

const isNumeric = number => {
  return !isNaN(parseFloat(number)) && isFinite(number);
};

class MongodbUri {
  private _mongodbUri: string;

  private _buildUriNoAccessCredential(builder: MongodbUriBuilder): string {
    return `mongodb://${builder.host}:${builder.port}`;
  }

  private _buildUriWithAccessCredential(builder: MongodbUriBuilder): string {
    return `mongodb://${builder.username}:${builder.password}@${builder.host}:${builder.port}`;
  }

  constructor(builder: MongodbUriBuilder) {
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
    if (host === 'localhost') {
      this._host = host;
      return this;
    }

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
    if (specialCharacters.some(password.includes)) {
      formattedPassword = encodeURIComponent(password);
      throw new Error('Password contains special characters');
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

class MongodbConfig {
  private _uri: string;
  private _databaseName: string;
  constructor(builder: MongodbConfigBuilder) {
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
let instance: MongodbService | null = null;
class MongodbService {
  private readonly _uri: string;
  private readonly _databaseName: string;
  private readonly _client: MongoClient;
  private readonly _aliasConnName: string;
  constructor(
    uri: string,
    databaseName: string,
    options: MongoClientOptions = {},
  ) {
    this._uri = uri;
    this._databaseName = databaseName;
    this._client = new MongoClient(this._uri, options);
  }

  // public init(uri) {
  //   if (instance) {
  //     throw new Error('MongodbService already initialized');
  //   }

  //   instance = new MongodbService(uri);
  // }

  public static getInstance(): MongodbService {
    if (!instance) {
      throw new Error('MongodbService not initialized. Call init() first');
    }

    return instance;
  }
}
