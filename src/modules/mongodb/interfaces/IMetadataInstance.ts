export enum StatusClient {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  PENDING = 'pending',
}

export interface IMetadataInstance {
  version: number;
  status: StatusClient;
  options: Record<string, any>;
  uri: string;
}
