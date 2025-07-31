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

@Injectable()
export class AuthService {
    private readonly redisClient: Redis;

    constructor(
        private readonly userRepository: UserRepository,
        private redisService: RedisService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
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
}

