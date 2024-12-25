import { winstonLogger } from '@amilbcahat/jobber-shared';
import { config } from '@notifications/config';
import client, { Channel, Connection } from 'amqplib';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationQueueConnection', 'info');

async function createConnection(): Promise<Channel | undefined> {
  try {
    const connection: Connection = await client.connect(`${config.RABBITMQ_ENDPOINT}`);
    const channel: Channel = await connection.createChannel();
    log.info('Notification Service connected to queue successfully...');
    closeConnection(channel, connection);
    return channel;
  } catch (error) {
    log.error(`Error creating connection: ${error}`);
    return undefined;
  }
}

function closeConnection(channel: Channel, connection: Connection): void {
  process.on('SIGINT', async () => {
    await channel.close();
    await connection.close();
    log.info('Notification Service disconnected from queue successfully...');
  });
}

export { createConnection };
