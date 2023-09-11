process.on('unhandledRejection', console.log);
import 'module-alias/register';
import 'source-map-support/register';

import { LoggerService } from './modules/logger/logger.module';
import { EnvironmentVariables } from './config/configuration.config';
import { ExceptionFactory } from './modules/exception-handler/exception-handler.factory';

import { MongodbConfigurationBuilder } from './modules/mongodb/mongodb-configuration.builder';
import { MongodbServiceFactory } from './modules/mongodb';

async function bootstrap(): Promise<0 | 1> {
  LoggerService.debug('Hello World!', EnvironmentVariables.getVariables());
  const mongoV3 = MongodbServiceFactory.getService(3);

  const LOCAL_DB = 'local-db';
  const localConfigurationDb = new MongodbConfigurationBuilder()
    .setHost('127.0.0.1')
    .setPort(27017)
    .setAlias(LOCAL_DB)
    .build();

  mongoV3.createClient(localConfigurationDb);

  await mongoV3.connect(LOCAL_DB);
  console.log('xyz', mongoV3.getMetadata(LOCAL_DB));
  const localDb = mongoV3.getDatabase(LOCAL_DB, 'demo-f8');
  const x = await localDb
    .collection('courses')
    .insertOne({ name: 'NodeJS', description: 'ReactJS is awesome!' });
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
