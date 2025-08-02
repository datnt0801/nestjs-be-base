import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QueueJobs, QueueNames } from 'src/constants/queue.constant';
import { VerifyEmailDto } from 'src/modules/email/dto/send-verify-email.dto';
import { EmailHelloDto } from 'src/modules/email/dto/email-hello.dto';
import { ForgotPasswordEmailDto } from 'src/modules/email/dto/forgot-password-email.dto';


@Injectable()
export class EmailService {
  constructor(
    @InjectQueue(QueueNames.EMAIL_QUEUE)
    private readonly mailQueue: Queue,
  ) {}

  async sendEmailHello(emailHelloDto: EmailHelloDto) {
    const job = await this.mailQueue.add(QueueJobs.SEND_EMAIL, {
      to: emailHelloDto.to,
      subject: emailHelloDto.emailSubject,
      template: 'hello',
      context: {
        emailSubject: emailHelloDto.emailSubject,
        content: emailHelloDto.content,
      },
    });
    return job;
  }

  async sendEmailVerify(emailVerifyDto: VerifyEmailDto) {
    const job = await this.mailQueue.add(QueueJobs.SEND_EMAIL, {
      to: emailVerifyDto.to,
      subject: emailVerifyDto.emailSubject,
      template: 'verify',
      context: {
        emailSubject: emailVerifyDto.emailSubject,
        verifyEmailUrl: emailVerifyDto.verifyEmailUrl,
      },
    });
    return job;
  }

  async sendEmailForgotPassword(forgotPasswordEmailDto: ForgotPasswordEmailDto) {
    const job = await this.mailQueue.add(QueueJobs.SEND_EMAIL, {
      to: forgotPasswordEmailDto.to,
      subject: forgotPasswordEmailDto.emailSubject,
      template: 'forgot-password',
      context: {
        emailSubject: forgotPasswordEmailDto.emailSubject,
        forgotPasswordUrl: forgotPasswordEmailDto.forgotPasswordUrl,
      },
    });
    return job;
  } 
}
