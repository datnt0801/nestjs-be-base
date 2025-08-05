import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from 'src/modules/auth/jwt/jwt.guard';
import { ERROR_MESSAGES } from 'src/shared/messages/error-messages';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  validate(payload: JwtPayload): boolean {
    if (!payload.userId) {
      this.logger.error('Undefined userId in jwt payload');

      throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED);
    }

    return true;
  }
}
