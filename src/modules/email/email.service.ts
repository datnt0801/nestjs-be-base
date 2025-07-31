import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QueueJobs, QueueNames } from 'src/constants/queue.constant';
import { EmailHelloDto } from 'src/modules/email/dto/email-hello.dto';


@Injectable()
export class EmailService {
  constructor(
    @InjectQueue(QueueNames.EMAIL_QUEUE)
    private readonly mailQueue: Queue,
  ) {}

  async sendEmailHello(emailHelloDto: EmailHelloDto) {
    console.log('[EmailService] Starting to queue email:', {
      to: emailHelloDto.to,
      subject: emailHelloDto.emailSubject,
      template: 'hello'
    });
    
    const job = await this.mailQueue.add(QueueJobs.SEND_EMAIL, {
      to: emailHelloDto.to,
      subject: emailHelloDto.emailSubject,
      template: 'hello',
      context: {
        emailSubject: emailHelloDto.emailSubject,
        content: emailHelloDto.content,
      },
    });

    console.log('[EmailService] Email queued successfully with job ID:', job.id);
    return job;
  }
}
