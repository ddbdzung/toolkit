export enum LoggerTag {
  INFO = 'INFO',
  ERROR = 'ERROR',
  WARN = 'WARN',
  DEBUG = 'DEBUG',
}
export enum LoggerColor {
  yellow = '\x1b[33m',
  red = '\x1b[31m',
  green = '\x1b[32m',
  cyan = '\x1b[36m',
  reset = '\x1b[0m',
}
export enum LoggerTagColor {
  INFO = LoggerColor.green,
  ERROR = LoggerColor.red,
  WARN = LoggerColor.yellow,
  DEBUG = LoggerColor.cyan,
}
