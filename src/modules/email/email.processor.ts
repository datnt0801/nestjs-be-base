import { MailerService } from '@nestjs-modules/mailer';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { QueueNames } from 'src/constants/queue.constant';

@Processor(QueueNames.EMAIL_QUEUE, { concurrency: 10 })
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly mailerService: MailerService) {
    super();
    this.logger.log('EmailProcessor is running');
  }
  // eslint-disable-next-line
  async process(job: Job): Promise<void> {
    this.logger.log('Processing email job with data:', {
      jobId: job.id,
      jobName: job.name,
      data: job.data,
    });
    const { data } = job;
    const { to, subject, template, context } = data;

    this.logger.log('template:', template);
    this.logger.log('context:', context);
    this.logger.log('to:', to);
    this.logger.log('subject:', subject);
    this.logger.log('job:', job);

    if (!to || !subject) {
      throw new Error('Email recipient (to) and subject are required');
    }

    try {
      this.logger.log('template', template);
      const emailResult = await this.mailerService.sendMail({
        to,
        subject,
        template,
        context,
      });
      this.logger.log(`Email sent to ${to}, subject: ${subject}. Done!`);
      this.logger.debug('Send mail result:', emailResult);
    } catch (error) {
      this.logger.error('Send mail fail');
      this.logger.error(error);

      throw error;
    }
  }
}
