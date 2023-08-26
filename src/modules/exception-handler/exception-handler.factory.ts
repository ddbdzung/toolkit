import { LoggerService } from '../logger/logger.service';

export class ExceptionFactory {
  public static captureException(err: Error, prefix?: string) {
    if (!(err instanceof Error)) {
      throw new Error('Invalid error type');
    }

    if (!prefix) {
      LoggerService.error('ExceptionFactory', err);
      return;
    }

    LoggerService.error(prefix, err);
  }
}
/**
 * Exception Dictionary Example
 */
/*
export class DocumentBuilderException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DocumentBuilderException';
  }
}
*/
