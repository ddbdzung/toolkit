import { Client as ClientV6 } from 'elasticsearch-v6';
import { Client as ClientV7 } from 'elasticsearch-v7';

import { ClientStatus, ElasticsearchClientVersion } from './elasticsearch.enum';

export type AliasClientName = string;

export type ClientInstance = ClientV6 | ClientV7;

export type MetadataInstance = {
  uri: string;
  version: ElasticsearchClientVersion;
  status: ClientStatus;
};

/**
 * @note health: The health status of the index, based on the following status values:
 * @note status: The status of the index, which can be one of the following values:
 * @note index: The name of the index.
 * @note uuid: The unique identifier of the index.
 * @note pri: The number of primary shards in the index.
 * @note rep: The number of replica shards in the index.
 * @note storeSize: The size of the index in bytes.
 * @note priStoreSize: The size of the primary shards in bytes.
 * @note docsCount: The total number of documents in the index.
 * @note docsDeleted: The number of deleted documents in the index.
 * @note health=green: All primary and replica shards are allocated.
 * @note health=yellow: All primary shards are allocated but not all replica shards are allocated.
 * @note health=red: Not all primary shards are allocated.
 * @note status=open: The index is open for read and write operations.
 * @note status=close: The index is closed, which means that it is blocked for read and write operations.
 */
export type GetAllIndicesResponse = {
  health: string;
  status: string;
  index: string;
  uuid: string;
  pri: number;
  rep: number;

  /**
   * @alias 'docs.count'
   */
  docsCount: number;

  /**
   * @alias 'docs.deleted'
   */
  docsDeleted: number;

  /**
   * @alias 'store.size'
   */
  storeSize: string;

  /**
   * @alias 'pri.store.size'
   */
  priStoreSize: string;
};

export type ElasticsearchInfo = {
  name: string;
  cluster_name: string;
  cluster_uuid: string;
  version: {
    number: string;
    build_flavor: string;
    build_type: string;
    build_hash: string;
    build_date: string;
    build_snapshot: boolean;
    lucene_version: string;
    minimum_wire_compatibility_version: string;
    minimum_index_compatibility_version: string;
  };
  tagline: string;
};
