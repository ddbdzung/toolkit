import 'module-alias/register';
import 'source-map-support/register';
process.on('unhandledRejection', console.log);

import { LoggerService } from './modules/logger/logger.module';
import { EnvironmentVariables } from './config/configuration.config';
import {
  MongodbConfigurationBuilder,
  MongodbService,
  MongodbUriBuilder,
} from './modules/mongodb/mongodb.service';

async function bootstrap(): Promise<0 | 1> {
  LoggerService.debug('Hello World!', EnvironmentVariables.getVariables());
  const localDbUri = new MongodbUriBuilder()
    .setHost('127.0.0.1')
    .setPort(27017)
    .build().mongodbUri;

  const localDbAlias = 'LOCAL_DB';
  const localDbConfig = new MongodbConfigurationBuilder()
    .setUri(localDbUri)
    .setAlias(localDbAlias)
    .build();

  console.log('localDbConfig', localDbConfig);
  console.log('MongodbService.metadata', MongodbService.metadata);
  MongodbService.createInstance(localDbConfig);
  console.log('MongodbService.metadata', MongodbService.metadata);
  await MongodbService.init(localDbAlias);
  console.log('MongodbService.metadata', MongodbService.metadata);
  const db = MongodbService.getInstance(localDbAlias, 'test');
  await db.collection('test').insertOne({ test: 'test' });

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
