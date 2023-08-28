import { ElasticsearchException } from './elasticsearch.module';

export class ClassBuilderPattern {
  /**
   * @returns {Object} Plain object of class instance properties
   */
  public toPlainObject() {
    return Object.getOwnPropertyNames(this).reduce((obj, key) => {
      obj[key] = this[key];
      return obj;
    }, {});
  }
}

class ClientUri extends ClassBuilderPattern {
  private _uri: string;
  constructor(uri: string) {
    super();
    this._uri = uri;
  }
  get uri() {
    return this._uri;
  }
}

const validIpAddressRegex =
  /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

const validHostnameRegex =
  /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]).)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/;

class ClientUriBuilder {
  constructor() {
    this._host = '127.0.0.1';
    this._port = 9200;
    this._protocol = 'http';
    this._user = '';
    this._password = '';
  }
  private _host: string;
  private _port: number;
  private _protocol: string;
  private _user: string;
  private _password: string;

  public get host() {
    return this._host;
  }

  public get port() {
    return this._port;
  }

  public get protocol() {
    return this._protocol;
  }

  public get user() {
    return this._user;
  }

  public get password() {
    return this._password;
  }

  public build() {
    if (!this._host) {
      throw new ElasticsearchException('Host is required');
    }

    if (!this._port) {
      throw new ElasticsearchException('Port is required');
    }

    if (!this._protocol) {
      throw new ElasticsearchException('Protocol is required');
    }

    if (this._user && this._password) {
      return new ClientUri(
        `${this._protocol}://${this._user}:${this._password}@${this._host}:${this._port}`,
      );
    }

    return new ClientUri(`${this._protocol}://${this._host}:${this._port}`);
  }

  public setHost(host: string) {
    if (!validIpAddressRegex.test(host) || !validHostnameRegex.test(host)) {
      throw new ElasticsearchException(
        'Host must be a valid ip address or hostname',
      );
    }

    this._host = host;
    return this;
  }

  public setPort(port: number) {
    if (port < 0 || port > 65535) {
      throw new ElasticsearchException('Port must be a valid port number');
    }

    this._port = port;
    return this;
  }

  public setProtocol(protocol: string) {
    if (protocol !== 'http' && protocol !== 'https') {
      throw new ElasticsearchException('Protocol must be either http or https');
    }

    this._protocol = protocol;
    return this;
  }

  public withCredential(user: string, password: string) {
    this._user = user;
    this._password = password;
    return this;
  }
}

export const elasticsearchBuilderCollection = {
  ClientUriBuilder,
};
