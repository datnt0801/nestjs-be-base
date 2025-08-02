import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import { resolve } from 'path';
import { config } from 'dotenv';

config();

const logger = new Logger('Mailer Config');

// Get the root path of the project
const rootPath = resolve(__dirname, '../../');
const templatePath = join(rootPath, 'src', 'modules', 'email', 'templates');

logger.log('Email template path:', templatePath);
logger.log('config: host', process.env.MAIL_HOST);
logger.log('config: port', process.env.MAIL_PORT);
logger.log('config: secure', process.env.MAIL_SECURE);
logger.log('config: user', process.env.MAIL_USER);
logger.log('config: password', process.env.MAIL_PASSWORD);
logger.log('config: from', process.env.MAIL_FROM);

export const mailerConfig: MailerOptions = {
  transport: {
    // host: process.env.MAIL_HOST || 'smtp.gmail.com',
    // port: Number.parseInt(process.env.MAIL_PORT!, 10) || 587,
    // secure: process.env.MAIL_SECURE === 'true',
    
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    requireTLS: true,

    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3',
    },
  },
  defaults: {
    from: `"No Reply" <${process.env.MAIL_FROM}>`,
  },
  template: {
    dir: templatePath,
    adapter: new HandlebarsAdapter(),
    options: {
      strict: false,
      inlineCssEnabled: false,
    },
  },
};
