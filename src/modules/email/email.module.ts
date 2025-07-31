import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bullmq';
import { mailerConfig } from 'src/configs/email.config';
import { QueueNames } from 'src/constants/queue.constant';
import { EmailProcessor } from './email.processor';

@Module({
  imports: [
    MailerModule.forRoot(mailerConfig),
    BullModule.registerQueue({
      name: QueueNames.EMAIL_QUEUE,
      defaultJobOptions: {
        attempts: 10,
        backoff: {
          type: 'exponential',
          delay: 10000,
        },
      },
    }),
  ],
  providers: [EmailService, EmailProcessor],
  exports: [EmailService],
})
export class EmailModule {}
