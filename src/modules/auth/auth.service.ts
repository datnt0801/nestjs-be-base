import { EmailForgotPasswordDto } from './../email/dto/email-forgot-password.dto';
import { config } from 'dotenv';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { BadRequestException, Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { UserRepository } from 'src/database/repositories/users.repository';
import { SignInDto } from 'src/modules/auth/dto/sign-in.dto';
import * as bcrypt from 'bcrypt';
import { ERROR_MESSAGES } from 'src/shared/messages/error-messages';
import { createHash } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from 'src/database/entities/user.entity';
import { JwtPayload } from 'src/modules/auth/jwt/jwt.guard';
import { UserStatus, UserType } from 'src/constants/enum.constant';
import { EmailHelloDto } from 'src/modules/email/dto/email-hello.dto';
import { EmailService } from 'src/modules/email/email.service';
import { RefreshTokenDto } from 'src/modules/auth/dto/refresh-token.dto';
import { VerifyEmailDto } from 'src/modules/email/dto/send-verify-email.dto';
import { VerifyEmailTokenDto } from 'src/modules/auth/dto/verify-email-token.dto';
import { ForgotPasswordDto } from 'src/modules/auth/dto/forgot-password.dto';
import { VerifyForgotPasswordDto } from 'src/modules/auth/dto/verify-forgot-password.dto';

@Injectable()
export class AuthService {
    private readonly redisClient: Redis;

    constructor(
        private readonly userRepository: UserRepository,
        private readonly redisService: RedisService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly emailService: EmailService,
    ) {
        this.redisClient = this.redisService.getClient();
    }

    

    async generateCredentials(user: UserEntity) {
        const payload: JwtPayload = { userId: user.id, userType: user.userType };
    
        const accessToken = await this.jwtService.signAsync(payload);
        const refreshAccessToken = createHash('sha256').update(accessToken).digest('hex');
    
        // Used for refresh access token (can upgrade to revoke a single access token? todo)
        await this.redisClient.set(
          `REFRESH_TOKEN_PREFIX_${refreshAccessToken}`,
          user.id,
          'EX',
          Number(this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')),
        );
    
        // Used for logout all devices
        await this.redisClient.set(
          `USER_ID_LOGIN_PREFIX_${user.id}_${refreshAccessToken}`,
          `REFRESH_TOKEN_PREFIX_${refreshAccessToken}`,
          'EX',
          Number(this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')),
        );
    
        return { accessToken, refreshAccessToken };
      }

    async signUp(signUpDto: SignUpDto) {
        if (signUpDto.password !== signUpDto.rePassword) {
            throw new BadRequestException(ERROR_MESSAGES.WRONG_USERNAME_OR_PASSWORD);
          }
      
          const checkUserExist = await this.userRepository.findOne({
            where: {
              email: signUpDto.email,
            },
          });
      
          if (checkUserExist) {
            throw new BadRequestException(ERROR_MESSAGES.USER_ALREADY_EXISTS);
          }
      
          const hashPassword = bcrypt.hashSync(signUpDto.password, 10);
          const newUser = new UserEntity();
          newUser.email = signUpDto.email;
          newUser.hashPassword = hashPassword;
          newUser.status = UserStatus.ACTIVE;
          newUser.userType = UserType.USER;
          newUser.emailVerified = false;
          newUser.googleUserId = 'null';
      
      
          await this.userRepository.save(newUser);

          delete (newUser as any).hashPassword;

          return newUser;  
    }

    async signIn(signInDto: SignInDto) {
        const user = await this.userRepository.findOne({
            where: {
              email: signInDto.email,
            },
          });
        if (!user) {
            throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
        }
        const isPasswordMatch = bcrypt.compareSync(signInDto.password, user.hashPassword);
        if (!isPasswordMatch) {
            throw new BadRequestException(ERROR_MESSAGES.WRONG_USERNAME_OR_PASSWORD);
        }
        return await this.generateCredentials(user);
    }

    async getMe(userId: number) {
        return this.userRepository.findOne({
            where: {
              id: userId,
            },
          });
    }

    async sendEmail(emailHelloDto: EmailHelloDto) {
        console.log('[AuthService] Starting sendEmail with data:', emailHelloDto);
        await this.emailService.sendEmailHello(emailHelloDto);
        const result = {message: 'Email sent successfully'};
        console.log('[AuthService] Email service completed successfully');
        return result;
    }

    async refreshToken(refreshTokenDto: RefreshTokenDto) {
        const validTokenPair = createHash('sha256').update(refreshTokenDto.accessToken).digest('hex') === refreshTokenDto.refreshAccessToken;
        if (!validTokenPair) {
          throw new BadRequestException(ERROR_MESSAGES.INVALID_TOKEN);
        }

        const userId = await this.redisClient.get(`REFRESH_TOKEN_PREFIX_${refreshTokenDto.refreshAccessToken}`);
        const user = await this.userRepository.findOne({
          where: {
            id: Number(userId),
          },
        });
        if (!user) {
          throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        await this.redisClient.del(`REFRESH_TOKEN_PREFIX_${refreshTokenDto.refreshAccessToken}`);
        await this.redisClient.del(`USER_ID_LOGIN_PREFIX_${user.id}_${refreshTokenDto.refreshAccessToken}`);
        
        return await this.generateCredentials(user);
    }



    async signOut(userId: number, accessToken: string) {
        const refreshAccessToken = createHash('sha256').update(accessToken).digest('hex');
        await this.redisClient.del(`REFRESH_TOKEN_PREFIX_${refreshAccessToken}`);
        await this.redisClient.del(`USER_ID_LOGIN_PREFIX_${userId}_${refreshAccessToken}`);
        return {message: 'Sign out successfully'};
    }

    async signOutAllDevices(userId: number) {
      const loginPrefixPattern = `USER_ID_LOGIN_PREFIX_${userId}_*`;
    
      const userLoginKeys = await this.redisClient.keys(loginPrefixPattern);
    
      if (userLoginKeys.length === 0) {
        return { message: 'No sessions found' };
      }
    
      const pipeline = this.redisClient.multi();
      for (const key of userLoginKeys) {
        pipeline.get(key); 
      }
    
      const refreshTokenKeys = await pipeline.exec().then(results =>
        results?.map(([err, val]) => (err ? null : val))
          .filter((val): val is string => typeof val === 'string'),
      );
    
      const keysToDelete = [...userLoginKeys, ...refreshTokenKeys||[]];
      if (keysToDelete.length > 0) {
        await this.redisClient.del(...keysToDelete);
      }
    
      return { message: `Signed out all devices for user ${userId}` };
    }

    async sendVerificationEmail(payload: JwtPayload) {
        const user = await this.userRepository.findOne({
            where: {
              id: payload.userId,
            },
          });
        if (!user) {
          throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        const verifyToken = createHash('sha256').update(Date.now().toString()).digest('hex');
        await this.redisClient.set(`VERIFY_TOKEN_PREFIX_${verifyToken}`, user.id, 'EX', Number(this.configService.get('EMAIL_VERIFY_TOKEN_EXPIRATION_TIME')));
        await this.redisClient.set(`USER_ID_VERIFY_TOKEN_PREFIX_${user.id}`, verifyToken, 'EX', Number(this.configService.get('EMAIL_VERIFY_TOKEN_EXPIRATION_TIME')));
        const verifyEmailDto: VerifyEmailDto = {
            to: user.email,
            emailSubject: 'Verify your email',
            verifyEmailUrl: `${this.configService.get('EMAIL_FRONTEND_VERIFY_URL')}?verify-token=${verifyToken}`,
        };
        const result = await this.emailService.sendEmailVerify(verifyEmailDto);
        if (!result) {
          return {message: 'Verification email sent failed'};
        }
        return {message: 'Verification email sent successfully'};
    }

    async verifyEmail(verifyTokenDto: VerifyEmailTokenDto) {
        const userId = await this.redisClient.get(`VERIFY_TOKEN_PREFIX_${verifyTokenDto.verifyToken}`);

        console.log('[AuthService] verifyEmail key:', this.redisClient.get(`VERIFY_TOKEN_PREFIX_${verifyTokenDto.verifyToken}`));
        console.log('[AuthService] verifyEmail key:', `VERIFY_TOKEN_PREFIX_${verifyTokenDto.verifyToken}`);
        console.log('[AuthService] verifyEmail userId:', userId);
        console.log('[AuthService] verifyEmail verifyTokenDto:', verifyTokenDto);
        if (!userId) {
          throw new BadRequestException(ERROR_MESSAGES.INVALID_TOKEN);
        }
        const user = await this.userRepository.findOne({
            where: {
              id: Number(userId),
            },
          });
        if (!user) {
          throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
        }
        user.emailVerified = true;
        await this.userRepository.save(user);
        await this.redisClient.del(`USER_ID_VERIFY_TOKEN_PREFIX_${user.id}`);
        await this.redisClient.del(`VERIFY_TOKEN_PREFIX_${verifyTokenDto.verifyToken}`);
        return {message: 'Email verified successfully'};
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        const user = await this.userRepository.findOne({
            where: {
              email: forgotPasswordDto.email,
            },
          });
        if (!user) {
          throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        const forgotPasswordToken = createHash('sha256').update(Date.now().toString()).digest('hex');

        await this.redisClient.set(`FORGOT_PASSWORD_TOKEN_PREFIX_${forgotPasswordToken}`, user.id, 'EX', Number(this.configService.get('EMAIL_VERIFY_TOKEN_EXPIRATION_TIME')));
        await this.redisClient.set(`FORGOT_PASSWORD_USER_ID_PREFIX_${user.id}`, forgotPasswordToken, 'EX', Number(this.configService.get('EMAIL_VERIFY_TOKEN_EXPIRATION_TIME')));
        
        const emailForgotPasswordDto: EmailForgotPasswordDto = {
            to: user.email,
            emailSubject: 'Forgot Password',
            forgotPasswordUrl: `${this.configService.get('EMAIL_FRONTEND_FORGOT_PASSWORD_URL')}?forgot-password-token=${forgotPasswordToken}`,
        };
        console.log('[AuthService] Starting sendEmailForgotPassword with data:', emailForgotPasswordDto);
        console.log('[AuthService] Reset password URL:', emailForgotPasswordDto.forgotPasswordUrl);
        const result = await this.emailService.sendEmailForgotPassword(emailForgotPasswordDto);
        console.log('[AuthService] Email service completed successfully');
        if (!result) {
          return {message: 'Forgot password email sent failed'};
        }
        return {message: `Forgot password email sent to ${emailForgotPasswordDto.to} successfully`};
    }

    async verifyForgotPasswordToken(verifyForgotPasswordDto: VerifyForgotPasswordDto) {
        const userId = await this.redisClient.get(`FORGOT_PASSWORD_TOKEN_PREFIX_${verifyForgotPasswordDto.token}`);
        console.log('[AuthService] verifyForgotPasswordToken userId:', userId);
        console.log('[AuthService] verifyForgotPasswordToken token:', verifyForgotPasswordDto.token);
        console.log('[AuthService] verifyForgotPasswordDto:', verifyForgotPasswordDto);
        if (!userId) {
          throw new BadRequestException(ERROR_MESSAGES.INVALID_TOKEN);
        }
        const user = await this.userRepository.findOne({
            where: {
              id: Number(userId),
            },
          });
        if (!user) {
          throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
        }
        user.hashPassword = bcrypt.hashSync(verifyForgotPasswordDto.newPassword, 10);
        await this.userRepository.save(user);
        await this.redisClient.del(`FORGOT_PASSWORD_USER_ID_PREFIX_${user.id}`);
        await this.redisClient.del(`FORGOT_PASSWORD_TOKEN_PREFIX_${verifyForgotPasswordDto.token}`);
        return {message: 'Forgot password verified successfully', User: user};
    }
}

