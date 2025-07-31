import { Body, Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtPayload } from 'src/modules/auth/jwt/jwt.guard';
import { GetJwtPayload } from 'src/shared/decorators/jwt-payload.decorator';

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

    @Get('/get-me')
    @ApiOperation({
        summary: 'Get me',
        description: 'Get me',
    })
    @ApiBearerAuth()
    getMe(@GetJwtPayload() payload: JwtPayload) {
        return this.authService.getMe(payload.userId);
    }
}
