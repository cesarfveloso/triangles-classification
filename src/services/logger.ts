import { createLogger, transports } from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';
import config from 'config';

export const logger = createLogger({
  transports: [
    new transports.Console({
      silent: !config.get('consoleLogs.enabled'),
      level: config.get('consoleLogs.level'),
    }),
    new WinstonCloudWatch({
      name: 'cloudwatch',
      logGroupName: config.get('cloudWatchLogs.groupName'),
      logStreamName: 'first',
      silent: !config.get('cloudWatchLogs.enabled'),
      level: config.get('cloudWatchLogs.level'),
    }),
  ],
  exitOnError: false,
});
