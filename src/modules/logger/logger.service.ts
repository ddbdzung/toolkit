import { LoggerColor, LoggerTag, LoggerTagColor } from './logger.constant';

export class LoggerService {
  static info(content: string, ...args: any) {
    const nodeEnv = process.env.NODE_ENV;
    if (!nodeEnv) throw new Error('[LoggerService] NODE_ENV is undefined]');

    if (nodeEnv === 'test') return;

    console.log(
      `[${this._colorizeText(
        'INFO',
        LoggerTagColor.INFO,
      )}]:${this._colorizeText(
        this._getTimestamp(),
        LoggerTagColor.INFO,
      )}: [${content}]`,
      ...args,
    );
  }

  static debug(content: string, ...args: any) {
    const nodeEnv = process.env.NODE_ENV;
    if (!nodeEnv) throw new Error('[LoggerService] NODE_ENV is undefined]');

    if (nodeEnv === 'test') return;

    console.log(
      `[${this._colorizeText(
        'DEBUG',
        LoggerTagColor.DEBUG,
      )}]:${this._colorizeText(
        this._getTimestamp(),
        LoggerTagColor.DEBUG,
      )}: [${content}]`,
      ...args,
    );
  }

  static error(content: string, ...args: any) {
    const nodeEnv = process.env.NODE_ENV;
    if (!nodeEnv) throw new Error('[LoggerService] NODE_ENV is undefined]');

    if (nodeEnv === 'test') return;

    console.log(
      `[${this._colorizeText(
        'ERROR',
        LoggerTagColor.ERROR,
      )}]:${this._colorizeText(
        this._getTimestamp(),
        LoggerTagColor.ERROR,
      )}: [${content}]`,
      ...args,
    );
  }

  static log(tag: LoggerTag, content: string, ...args: any) {
    const nodeEnv = process.env.NODE_ENV;
    if (!nodeEnv) throw new Error('[LoggerService] NODE_ENV is undefined]');

    if (nodeEnv === 'test') return;
    if (nodeEnv === 'production' && tag === LoggerTag.DEBUG) return;

    console.log(
      `[${this._colorizeText(tag, LoggerTagColor[tag])}]:${this._colorizeText(
        this._getTimestamp(),
        LoggerTagColor.DEBUG,
      )}: [${content}]`,
      ...args,
    );
  }

  private static _getTimestamp = () => new Date().toISOString();
  private static _colorizeText = (
    text: string,
    color: LoggerColor | LoggerTagColor,
  ) => `${color}${text}${LoggerColor.reset}`;
}
