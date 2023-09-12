process.on('unhandledRejection', console.log);
import 'module-alias/register';
import 'source-map-support/register';

import { LoggerService } from './modules/logger/logger.module';
import { EnvironmentVariables } from './config/configuration.config';
import { ExceptionFactory } from './modules/exception-handler/exception-handler.factory';

import {
  MongodbConfigurationBuilder,
  MongodbDriverVersion,
  MongodbServiceFactory,
  MongodbServiceV3,
} from '@/modules/mongodb';

async function bootstrap(): Promise<0 | 1> {
  LoggerService.debug('Hello World!', EnvironmentVariables.getVariables());

  const mongoV3 = MongodbServiceFactory.getMongodbService<MongodbServiceV3>(
    MongodbDriverVersion.V3,
  );
  const LOCAL_DB = 'local-db';
  const localConfigurationDb = new MongodbConfigurationBuilder()
    .setHost('127.0.0.1')
    .setPort(27017)
    .setAlias(LOCAL_DB)
    .build();
  mongoV3.createClient(localConfigurationDb);
  await mongoV3.connect(LOCAL_DB);
  const client = mongoV3.getClient(LOCAL_DB);
  const pResult = client.db('admin').collection('test').find({});
  const result = await pResult.toArray();
  LoggerService.debug('Find documents', result);

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
