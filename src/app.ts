//This is the entry file for the command npm run dev
// import { winstonLogger } from '@amilbcahat/jobber-shared';
// import { Logger } from 'winston';
// import { config } from '@notifications/config';
import express, { Express } from 'express';
import { start } from '@notifications/server';
// const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationApp', 'debug');

function initialize(): void {
  const app: Express = express();
  start(app);
}
initialize();
