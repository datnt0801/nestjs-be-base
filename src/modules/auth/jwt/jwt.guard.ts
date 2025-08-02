import { RedisService } from '@liaoliaots/nestjs-redis';
import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { createHash } from 'crypto';
import { UserType } from 'src/constants/enum.constant';
import { ERROR_MESSAGES } from 'src/shared/messages/error-messages';

export class JwtPayload {
  userId: number;

  userType: UserType;

  iat?: string;

  exp?: string;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly redisService: RedisService, private jwtService: JwtService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const superResult = await super.canActivate(context);

      if (!superResult) {
        return false;
      }
    } catch (error) {
      console.error('error', error);
    }

    try {
      const request = context.switchToHttp().getRequest();
      const token = request.headers.authorization;
      const accessToken = token.split(' ')[1];
      const hashedAccessToken = createHash('sha256').update(accessToken).digest('hex');
      const redisCheckAccessToken = await this.redisService
        .getClient()
        .get(`REFRESH_TOKEN_PREFIX_${hashedAccessToken}`);

      if (!redisCheckAccessToken) {
        this.logger.error('Undefined hashedAccessToken in redis');

        throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED);
      }

      const payload = await this.jwtService.verifyAsync(accessToken);

      request.payload = payload;

      return true;
    } catch (error) {
      this.logger.error(error);

      throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED);
    }
  }
}
