//Notification service will be responsible only for consuming

import { IEmailLocals, winstonLogger } from '@amilbcahat/jobber-shared';
import { config } from '@notifications/config';
import { Channel, ConsumeMessage } from 'amqplib';
import { createConnection } from '@notifications/queues/connection';
import { Logger } from 'winston';
import { sendEmail } from '@notifications/queues/mail.transport';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'emailConsumer', 'debug');

async function consumeOrderEmailMessages(channel: Channel): Promise<void> {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    //The Exchange Name + routing key -> maps to queue name
    const exchangeName = 'jobber-order-notification';
    const routingKey = 'order-email';
    const queueName = 'order-email-queue';
    //Which type of exchange?
    await channel.assertExchange(exchangeName, 'direct');
    //Durable queue means that the queue messages will persist even if the RabbitMQ server restarts
    const jobberQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: true });
    //Bind the queue to the exchange + routing key
    await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey);
    channel.consume(jobberQueue.queue, async (msg: ConsumeMessage | null) => {
      const {
        receiverEmail,
        username,
        template,
        sender,
        offerLink,
        amount,
        buyerUsername,
        sellerUsername,
        title,
        description,
        deliveryDays,
        orderId,
        orderDue,
        requirements,
        orderUrl,
        originalDate,
        newDate,
        reason,
        subject,
        header,
        type,
        message,
        serviceFee,
        total
      } = JSON.parse(msg!.content.toString());
      const locals: IEmailLocals = {
        appLink: `${config.CLIENT_URL}`,
        appIcon: 'https://i.ibb.co/Kyp2m0t/cover.png',
        username,
        sender,
        offerLink,
        amount,
        buyerUsername,
        sellerUsername,
        title,
        description,
        deliveryDays,
        orderId,
        orderDue,
        requirements,
        orderUrl,
        originalDate,
        newDate,
        reason,
        subject,
        header,
        type,
        message,
        serviceFee,
        total
      };
      if (template === 'orderPlaced') {
        await sendEmail('orderPlaced', receiverEmail, locals);
        await sendEmail('orderReceipt', receiverEmail, locals);
      } else {
        //For order related templates like orderExtension , etc 
        await sendEmail(template, receiverEmail, locals);
      }
      channel.ack(msg!);
    });
  } catch (error) {
    log.log('error', 'NotificationService EmailConsumer consumeAuthEmailMessages() method error', error);
  }
}

async function consumeAuthEmailMessages(channel: Channel): Promise<void> {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    //The Exchange Name + routing key -> maps to queue name
    const exchangeName = 'jobber-email-notification';
    const routingKey = 'auth-email';
    const queueName = 'auth-email-queue';
    //Which type of exchange?
    await channel.assertExchange(exchangeName, 'direct');
    //Durable queue means that the queue messages will persist even if the RabbitMQ server restarts
    const jobberQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: true });
    //Bind the queue to the exchange + routing key
    await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey);
    channel.consume(jobberQueue.queue, async (msg: ConsumeMessage | null) => {
      console.log(JSON.parse(msg!.content.toString()));
      const { receiverEmail, username, verifyLink, resetLink, template } = JSON.parse(msg!.content.toString());
      // send emails
      const locals: IEmailLocals = {
        appLink: `${config.CLIENT_URL}`,
        appIcon: `https://i.ibb.co/Kyp2m0t/cover.png`,
        username,
        verifyLink,
        resetLink
      };
      await sendEmail(template, receiverEmail, locals);

      channel.ack(msg!);
    });
  } catch (error) {
    log.log('error', 'NotificationService EmailConsumer consumeAuthEmailMessages() method error', error);
  }
}

export { consumeAuthEmailMessages, consumeOrderEmailMessages };
