import * as winston from 'winston';
import { join } from 'path';
import { utilities } from 'nest-winston';

export const dailyOption = (level: string) => {
  return {
    filename: 'application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: false,
    maxSize: '20m',
    maxFiles: '14d',
    auditFile: 'audit.json',
    dirname:
      process.env.NODE_ENV === 'production'
        ? join(__dirname, `../logs/${level}/prod/`)
        : join(__dirname, `../logs/${level}/dev/`), //path to where save lo
    level,
    format: winston.format.combine(
      winston.format.timestamp(),
      utilities.format.nestLike(process.env.NODE_ENV, {
        colors: false,
        prettyPrint: true,
      }),
    ),
  };
};
