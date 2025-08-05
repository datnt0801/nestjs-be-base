import { Logger, UnauthorizedException, createParamDecorator } from '@nestjs/common';
import { ERROR_MESSAGES } from 'src/shared/messages/error-messages';

const logger = new Logger('GetJwtPayload');

export const GetJwtPayload = createParamDecorator((data, ctx) => {
  const request = ctx.switchToHttp().getRequest();

  if (request.payload) {
    return request.payload;
  }

  logger.log('Undefined jwt payload in request');

  throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED);
});
