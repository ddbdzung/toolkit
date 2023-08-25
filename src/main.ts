import 'module-alias/register';
import 'source-map-support/register';
process.on('unhandledRejection', console.log);

import { LoggerService } from './modules/logger/logger.module';
import { EnvironmentVariables } from './config/configuration.config';
import {
  MongodbConfigurationBuilder,
  MongodbService,
} from './modules/mongodb/mongodb.service';

async function bootstrap(): Promise<0 | 1> {
  LoggerService.debug('Hello World!', EnvironmentVariables.getVariables());
  const configurationssss = new MongodbConfigurationBuilder()
    .setUri('mongodb://127.0.0.1:27017')
    .setAlias('test')
    .build();
  console.log('abc', MongodbService.instances);
  const test = new MongodbService(configurationssss);
  console.log('abc123', MongodbService.metadata);
  await MongodbService.init(configurationssss.alias);
  console.log('435wsergdfx', MongodbService.metadata);

  return 0;
}

bootstrap()
  .then(exitCode => {
    LoggerService.info(bootstrap.name, 'Program shut down gracefully!');
    process.exit(exitCode);
  })
  .catch(err => {
    LoggerService.error(bootstrap.name, 'Bootstrap failed', err);
    process.exit(1);
  });
