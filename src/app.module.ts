import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { redisConfig } from 'src/configs/redis.config';
import { JwtStrategy } from 'src/modules/auth/jwt/jwt.strategy';
import { RequestLogMiddleware } from 'src/shared/middlewares/request-log.middleware';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { BullModule } from '@nestjs/bullmq';
import { queueRedisOptions } from 'src/configs/queue.config';
import { EmailModule } from 'src/modules/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    RedisModule.forRootAsync({
      useFactory: () => redisConfig,
    }),
    BullModule.forRoot({
      connection: queueRedisOptions,
    }),
    PassportModule,
    JwtModule.register({
      signOptions: {
        expiresIn: Number(process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME) || '30d',
      },
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      global: true,
    }),
    AuthModule,
    EmailModule,
  ],
  controllers: [],
  providers: [JwtStrategy],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLogMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}