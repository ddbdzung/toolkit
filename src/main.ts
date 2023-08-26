process.on('unhandledRejection', console.log);
import 'module-alias/register';
import 'source-map-support/register';

import { LoggerService } from './modules/logger/logger.module';
import { EnvironmentVariables } from './config/configuration.config';
import {
  MongodbConfigurationBuilder,
  MongodbService,
  MongodbUriBuilder,
} from './modules/mongodb/mongodb.service';
import { ExceptionFactory } from './modules/exception-handler/exception-handler.factory';

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

  MongodbService.createInstance(localDbConfig);
  await MongodbService.init(localDbAlias);
  const localDb = MongodbService.getDatabase(localDbAlias, 'demo-f8');
  const x = await localDb
    .collection('courses')
    .insertOne({ name: 'NodeJS', description: 'NodeJS is awesome!' });

  LoggerService.debug('Inserted document', x);

  return 0;
}

bootstrap()
  .then(exitCode => {
    LoggerService.info(bootstrap.name, 'Program shut down gracefully!');
    process.exit(exitCode);
  })
  .catch(err => {
    ExceptionFactory.captureException(err, bootstrap.name);
    process.exit(1);
  });
