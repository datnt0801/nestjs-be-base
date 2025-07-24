import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const logger = new Logger('Nest');

  const port = process.env.PORT || 8000;
  const appName = process.env.APP_NAME || 'NestJS Backend';

  app.setGlobalPrefix('api');
  const options = new DocumentBuilder().addBearerAuth().setTitle(`${appName}`).build();
  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: `${appName} API Docs`,
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      displayRequestDuration: true,
    },
  });

  await app.listen(port, () => {
    logger.log(`🚀 ${appName} server starts at ${port}!`);
  });
}
bootstrap();
