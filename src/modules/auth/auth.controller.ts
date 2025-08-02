import { Body, Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtPayload } from 'src/modules/auth/jwt/jwt.guard';
import { GetJwtPayload } from 'src/shared/decorators/jwt-payload.decorator';
import { SendMailDto } from './dto/send-mail-dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/jwt/jwt.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyEmailDto } from 'src/modules/email/dto/send-verify-email.dto';
import { VerifyEmailTokenDto } from 'src/modules/auth/dto/verify-email-token.dto';
import { ForgotPasswordDto } from 'src/modules/auth/dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

   
    @Post('/sign-up')
    @ApiOperation({
        summary: 'Sign up',
        description: 'Sign up',
    })
    signUp(@Body() signUpDto: SignUpDto) {
        return this.authService.signUp(signUpDto);
    }

    @Post('/sign-in')   
    @ApiOperation({
        summary: 'Sign in',
        description: 'Sign in',
    })
    signIn(@Body() signInDto: SignInDto) {
        return this.authService.signIn(signInDto);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/get-me')
    @ApiOperation({
        summary: 'Get me',
        description: 'Get me',
    })
    getMe(@GetJwtPayload() payload: JwtPayload) {
        return this.authService.getMe(payload.userId);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('/send-email')
    @ApiOperation({
        summary: 'Send email',
        description: 'Send email',
    })
    async sendEmail(@Body() sendMailDto: SendMailDto) {
        console.log('[AuthController] Starting sendEmail with data:', sendMailDto);
        const result = await this.authService.sendEmail(sendMailDto);
        console.log('[AuthController] Email sent successfully');
        return result;
    }

    @Post('/refresh-token')
    @ApiOperation({
        summary: 'Refresh token',
        description: 'Refresh token',
    })
    refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('/sign-out')
    @ApiOperation({
        summary: 'Sign out',
        description: 'Sign out',
    })
    signOut(@GetJwtPayload() payload: JwtPayload, @Req() req: Request) {
        return this.authService.signOut(payload.userId, req.headers.authorization?.split(' ')[1]||'');
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('/sign-out-all-devices')
    @ApiOperation({
        summary: 'Sign out all devices',
        description: 'Sign out all devices',
    })
    signOutAllDevices(@GetJwtPayload() payload: JwtPayload) {
        return this.authService.signOutAllDevices(payload.userId);
    }   

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('/send-verification-email')
    @ApiOperation({
        summary: 'Send verification email',
        description: 'Send verification email',
    })
    sendVerificationEmail(@GetJwtPayload() payload: JwtPayload) {
        return this.authService.sendVerificationEmail(payload);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('/verify-email')
    @ApiOperation({
        summary: 'Verify email',
        description: 'Verify email',
    })
    verifyEmail(@Body() verifyEmailTokenDto: VerifyEmailTokenDto) {
        return this.authService.verifyEmail(verifyEmailTokenDto);
    }

    @Post('/forgot-password')
    @ApiOperation({
        summary: 'Forgot password',
        description: 'Forgot password',
    })
    forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    // @Post('/verify-forgot-password-token')
    // @ApiOperation({
    //     summary: 'Verify forgot password token',
    //     description: 'Verify forgot password token',
    // })
    // verifyForgotPasswordToken(@Body() verifyForgotPasswordTokenDto: VerifyForgotPasswordTokenDto) {
    //     return this.authService.verifyForgotPasswordToken(verifyForgotPasswordTokenDto);
    // }

}
