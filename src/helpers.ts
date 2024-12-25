import { IEmailLocals, winstonLogger } from '@amilbcahat/jobber-shared';
import { config } from '@notifications/config';
import { Logger } from 'winston';
import nodemailer, { Transporter } from 'nodemailer';
import Email from 'email-templates';
import path from 'path';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'mailTransportHelper', 'debug');

async function emailTemplates(template: string, receiver: string, locals: IEmailLocals): Promise<void> {
  try {
    const smtpTransport: Transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: config.SENDER_EMAIL,
        pass: config.SENDER_EMAIL_PASSWORD
      }
    });
    const email: Email = new Email({
      message: {
        from: `Jobber App <${config.SENDER_EMAIL}>`
      },
      send: true,
      preview: false,
      transport: smtpTransport,
      views: {
        options: {
          extension: 'ejs'
        }
      },
      juice: true, //be able to use inline css in the email
      juiceResources: {
        preserveImportant: true, //preserve important css
        webResources: {
          relativeTo: path.resolve(__dirname, '../build') //find css files in the build folder
        }
      }
    });
    await email.send({
      template: path.join(__dirname, '..', 'src/emails', template),
      message: {
        to: receiver
      },
      locals
    });
  } catch (error) {
    log.error(error);
  }
}

export { emailTemplates };
