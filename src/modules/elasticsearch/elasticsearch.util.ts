import { AxiosError } from 'axios';

import { ElasticsearchException } from './elasticsearch.module';

export const handleAxiosError = (error: AxiosError) => {
  if (error?.code === 'ECONNREFUSED') {
    throw new Error('Connection refused');
  }

  throw new ElasticsearchException(error.message);
};
