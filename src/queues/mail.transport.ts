//For Prod , use SendGrid
//For Dev, use Nodemailer

import { IEmailLocals, winstonLogger } from '@amilbcahat/jobber-shared';
import { config } from '@notifications/config';
import { emailTemplates } from '@notifications/helpers';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'mailTransport', 'debug');

async function sendEmail(template: string, recieverEmail: string, locals: IEmailLocals): Promise<void> {
  try {
    await emailTemplates(template, recieverEmail, locals);
    log.info('Email sent successfully');
  } catch (error) {
    log.error('error', 'NotificationService sendEmail() method error', error);
  }
}

export { sendEmail };
