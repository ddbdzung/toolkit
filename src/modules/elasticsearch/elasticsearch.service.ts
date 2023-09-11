import axios from 'axios';
import {
  ClientOptions as ClientOptionsV6,
  Client as ClientV6,
} from 'elasticsearch-v6';
import {
  ClientOptions as ClientOptionsV7,
  Client as ClientV7,
} from 'elasticsearch-v7';

import { LoggerService } from '../logger/logger.service';
import { handleAxiosError } from './elasticsearch.helper';
import { ElasticsearchException } from './elasticsearch.module';
import { IElasticsearchAPI } from './elasticsearch.interface';
import { ClientStatus, ElasticsearchClientVersion } from './elasticsearch.enum';
import {
  AliasClientName,
  ClientInstance,
  ElasticsearchInfo,
  GetAllIndicesResponse,
  MetadataInstance,
} from './elasticsearch.type';

export class ElasticsearchAPI implements IElasticsearchAPI {
  private static _instance: ElasticsearchAPI;
  protected _getAllIndicesAPI: Map<ElasticsearchClientVersion, string>;

  private constructor() {
    this._getAllIndicesAPI = new Map();
    this._getAllIndicesAPI.set(ElasticsearchClientVersion.V6, '_cat/indices');
    this._getAllIndicesAPI.set(ElasticsearchClientVersion.V7, '_cat/indices');
    this._getAllIndicesAPI.set(ElasticsearchClientVersion.V8, '_cat/indices');

    LoggerService.info(ElasticsearchAPI.name, 'Init ElasticsearchAPI');
  }

  public static getInstance() {
    if (!ElasticsearchAPI._instance) {
      ElasticsearchAPI._instance = new ElasticsearchAPI();
    }

    return ElasticsearchAPI._instance;
  }
  public getAllIndicesAPI(version: ElasticsearchClientVersion) {
    return this._getAllIndicesAPI.get(version);
  }
}

export class ElasticsearchService {
  private static _instances: Map<AliasClientName, ClientInstance> = new Map();
  private static _metadata: Map<AliasClientName, MetadataInstance> = new Map();
  private constructor() {
    LoggerService.debug(ElasticsearchService.name, 'Init ElasticsearchService');
  }
  private static _getMetadataOfConnectedClient(alias: AliasClientName) {
    if (!ElasticsearchService._metadata.has(alias)) {
      throw new ElasticsearchException(`Client alias='${alias}' not found`);
    }

    const { metadata } = ElasticsearchService.getInstance(alias);
    if (metadata.status === ClientStatus.DISCONNECTED) {
      throw new ElasticsearchException('Client disconnected');
    }

    return metadata;
  }

  public static async initV6(
    uri: string,
    alias: AliasClientName,
    options: ClientOptionsV6 = {},
  ) {
    const opts = Object.assign({ node: uri }, options);
    const serverInfo = await ElasticsearchService.ping(uri);
    const version = serverInfo.version.number.substring(0, 1);
    if (version !== ElasticsearchClientVersion.V6) {
      throw new ElasticsearchException(
        `Version mismatch. Expected initV${version}()`,
      );
    }

    const client = new ClientV6(opts);
    const metadata: MetadataInstance = {
      uri,
      version,
      status: ClientStatus.CONNECTED,
    };

    ElasticsearchService._instances.set(alias, client);
    ElasticsearchService._metadata.set(alias, metadata);
  }

  public static async initV7(
    uri: string,
    alias: AliasClientName,
    options: ClientOptionsV7 = {},
  ) {
    const opts = Object.assign({ node: uri }, options);
    const serverInfo = await ElasticsearchService.ping(uri);
    const version = serverInfo.version.number.substring(0, 1);
    if (version !== ElasticsearchClientVersion.V7) {
      throw new ElasticsearchException(
        `Version mismatch. Expected initV${version}()`,
      );
    }

    const client = new ClientV7(opts);
    const metadata: MetadataInstance = {
      uri,
      version,
      status: ClientStatus.CONNECTED,
    };

    ElasticsearchService._instances.set(alias, client);
    ElasticsearchService._metadata.set(alias, metadata);
  }

  public static getInstance(alias: AliasClientName) {
    const instance = ElasticsearchService._instances.get(alias);
    const metadata = ElasticsearchService._metadata.get(alias);
    if (!instance) {
      throw new ElasticsearchException(`Client alias='${alias}' not found`);
    }

    return {
      instance,
      metadata,
    };
  }

  public static async ping(uri: string): Promise<ElasticsearchInfo> {
    try {
      const { data } = await axios.get(uri);
      if (!data) {
        throw new Error(`Ping uri='${uri}' failed`);
      }

      LoggerService.info('ElasticsearchService', `Ping uri='${uri}' success`);
      return data;
    } catch (err) {
      handleAxiosError(err);
    }
  }

  private static _computeGetAllIndicesResponse(
    rawText: string,
  ): GetAllIndicesResponse[] {
    const result = rawText
      .split('\n')
      .filter(item => item !== '')
      .map(item => {
        const [
          health,
          status,
          index,
          uuid,
          pri,
          rep,
          docsCount,
          docsDeleted,
          storeSize,
          priStoreSize,
        ] = item.split(' ').filter(item => item !== '');

        return {
          health,
          status,
          index,
          uuid,
          pri: Number(pri),
          rep: Number(rep),
          docsCount: Number(docsCount),
          docsDeleted: Number(docsDeleted),
          storeSize,
          priStoreSize,
        };
      });
    return result as GetAllIndicesResponse[];
  }

  public static async getAllIndices(
    alias: AliasClientName,
  ): Promise<GetAllIndicesResponse[]> {
    const { version, uri } =
      ElasticsearchService._getMetadataOfConnectedClient(alias);

    const endpoint = ElasticsearchAPI.getInstance().getAllIndicesAPI(version);
    try {
      const { data } = await axios.get(`${uri}/${endpoint}`);

      return ElasticsearchService._computeGetAllIndicesResponse(data);
    } catch (err) {
      handleAxiosError(err);
    }
  }
  // async createIndexV6(name, mapping = {}) {
  //   try {
  //     const { clientV6 } = this;
  //     const indexExists = await clientV6.indices.exists({ index: name });
  //     if (indexExists?.body === true && indexExists.statusCode === 200) {
  //       return false;
  //     }
  //     if (indexExists?.body === false && indexExists.statusCode === 404) {
  //       const result = await clientV6.indices.create({
  //         index: name,
  //         body: mapping,
  //       });

  //       return result.statusCode === 200 ? true : false;
  //     }

  //     return false;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // /**
  //  * @param {string} name
  //  */
  // async deleteIndexV6(name) {
  //   try {
  //     const { clientV6 } = this;
  //     const indexExists = await clientV6.indices.exists({ index: name });
  //     if (indexExists?.body === true && indexExists.statusCode === 200) {
  //       const result = await clientV6.indices.delete({ index: name });
  //       return result.statusCode === 200 ? true : false;
  //     }

  //     return false;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // /**
  //  * @param {{ index: string, type: string, body: any }} Options
  //  */
  // async bulkV6({ index, type, body }) {
  //   try {
  //     const { clientV6 } = this;
  //     const result = await clientV6.bulk({
  //       body,
  //     });
  //     return result;
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}
