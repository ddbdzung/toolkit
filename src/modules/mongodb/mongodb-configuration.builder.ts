import { MongoClientOptions as MongoClientOptionsV3 } from 'mongodb-v3';
import { MongoClientOptions as MongoClientOptionsV4 } from 'mongodb-v4';
import { MongoClientOptions as MongoClientOptionsV5 } from 'mongodb-v5';
import { MongoClientOptions as MongoClientOptionsV6 } from 'mongodb-v6';

import { MongodbModuleException } from './mongodb.exception';
import { ObjectiveClass } from './mongodb.common';

const isNumeric = number => {
  return !isNaN(parseFloat(number)) && isFinite(number);
};

const validIpAddressRegex =
  /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

const validHostnameRegex =
  /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]).)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/;

export class MongodbConfiguration extends ObjectiveClass {
  private readonly _uri: string;
  private readonly _alias: string;
  private readonly _options: MongoClientOptionsV3 &
    MongoClientOptionsV4 &
    MongoClientOptionsV5 &
    MongoClientOptionsV6;
  constructor(builder: MongodbConfigurationBuilder) {
    super();
    this._uri = builder.uriConfig.hasAccessCredentials
      ? this._buildUriWithAccessCredential(builder)
      : this._buildUriNoAccessCredential(builder);
    this._alias = builder.alias;
    this._options = builder.options;
  }

  private _buildUriNoAccessCredential(
    builder: MongodbConfigurationBuilder,
  ): string {
    return `mongodb://${builder.uriConfig.host}:${builder.uriConfig.port}`;
  }

  private _buildUriWithAccessCredential(
    builder: MongodbConfigurationBuilder,
  ): string {
    return `mongodb://${builder.uriConfig.username}:${builder.uriConfig.password}@${builder.uriConfig.host}:${builder.uriConfig.port}`;
  }

  get uri(): string {
    return this._uri;
  }
  get alias(): string {
    return this._alias;
  }
  get options(): MongoClientOptionsV3 &
    MongoClientOptionsV4 &
    MongoClientOptionsV5 &
    MongoClientOptionsV6 {
    return this._options;
  }
}

export class MongodbConfigurationBuilder {
  private _uriConfig: {
    host: string;
    port: number;
    hasAccessCredentials: boolean;
    username: string;
    password: string;
  };
  private _alias: string;
  private _options: MongoClientOptionsV3 &
    MongoClientOptionsV4 &
    MongoClientOptionsV5 &
    MongoClientOptionsV6;

  constructor() {
    this._uriConfig = {
      host: '',
      port: 0,
      hasAccessCredentials: false,
      username: '',
      password: '',
    };
    this._alias = '';
    this._options = {};
  }

  public get uriConfig(): {
    host: string;
    port: number;
    hasAccessCredentials: boolean;
    username: string;
    password: string;
  } {
    return this._uriConfig;
  }
  public get alias(): string {
    return this._alias;
  }
  public get options(): MongoClientOptionsV3 &
    MongoClientOptionsV4 &
    MongoClientOptionsV5 &
    MongoClientOptionsV6 {
    return this._options;
  }

  public setHost(host: string): MongodbConfigurationBuilder {
    if (!validIpAddressRegex.test(host) || !validHostnameRegex.test(host)) {
      throw new MongodbModuleException(
        'Host must be a valid ip address or hostname',
      );
    }

    this._uriConfig.host = host;
    return this;
  }

  public setPort(port: number): MongodbConfigurationBuilder {
    if (!isNumeric(port)) {
      throw new MongodbModuleException('Port must be a number');
    }

    if (port < 0 || port > 65535) {
      throw new MongodbModuleException('Port must be between 0 and 65535');
    }

    this._uriConfig.port = port;
    return this;
  }

  public withAccessCredentials(
    username: string,
    password: string,
  ): MongodbConfigurationBuilder {
    const specialCharacters = ['$', ':', '/', '?', '#', '[', ']', '@'];
    let formattedPassword = password;
    if (specialCharacters.some(char => password.includes(char))) {
      formattedPassword = encodeURIComponent(password);
    }

    this._uriConfig.hasAccessCredentials = true;
    this._uriConfig.username = username;
    this._uriConfig.password = formattedPassword;
    return this;
  }

  public setAlias(alias: string): MongodbConfigurationBuilder {
    this._alias = alias;
    return this;
  }

  public withOptions(
    options: MongoClientOptionsV3 &
      MongoClientOptionsV4 &
      MongoClientOptionsV5 &
      MongoClientOptionsV6,
  ): MongodbConfigurationBuilder {
    this._options = options;
    return this;
  }

  public build() {
    if (!this._uriConfig.host) {
      throw new MongodbModuleException(
        'Host required to build mongodb configuration',
      );
    }

    if (!this._uriConfig.port) {
      throw new MongodbModuleException(
        'Port required to build mongodb configuration',
      );
    }

    if (!this._alias) {
      throw new MongodbModuleException(
        'Alias required to build mongodb configuration',
      );
    }

    return new MongodbConfiguration(this);
  }
}
