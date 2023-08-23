import 'module-alias/register';

import { LoggerService } from './modules/logger/logger.module';
import { EnvironmentVariables } from './config/configuration.config';

async function bootstrap(): Promise<0 | 1> {
  LoggerService.debug('Hello World!');

  console.log('env123', EnvironmentVariables.getVariables());
  console.log('env', EnvironmentVariables.get('app.env'));

  return 0;
}

bootstrap()
  .then(exitCode => {
    LoggerService.debug('Program shut down gracefully!');
    process.exit(exitCode);
  })
  .catch(err => {
    LoggerService.error('Bootstrap failed', err);
    process.exit(1);
  });
