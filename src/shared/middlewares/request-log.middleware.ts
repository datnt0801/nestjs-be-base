import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLogMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLogMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.log('Request information:');
    this.logger.log({
      path: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
    });
    next();
  }
}
