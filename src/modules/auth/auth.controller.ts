import { Body, Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtPayload } from 'src/modules/auth/jwt/jwt.guard';
import { GetJwtPayload } from 'src/shared/decorators/jwt-payload.decorator';
import { SendMailDto } from './dto/send-mail-dto';

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
    @Get('/get-me')
    @ApiOperation({
        summary: 'Get me',
        description: 'Get me',
    })
    getMe(@GetJwtPayload() payload: JwtPayload) {
        return this.authService.getMe(payload.userId);
    }

    @ApiBearerAuth()
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
}
