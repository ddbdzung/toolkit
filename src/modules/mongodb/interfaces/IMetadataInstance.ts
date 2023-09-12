import { StatusClient } from '../services/mongodb.enum';

export interface IMetadataInstance {
  version: number;
  status: StatusClient;
  options?: Record<string, any>;
  uri: string;
}
