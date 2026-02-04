import {
    Controller,
    Post,
    UseGuards,
    Req,
    Body,
    Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './dto/register.dto';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private configService: ConfigService) { }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const { access_token } = await this.authService.login(req.user);
        res.cookie('access_token', access_token, {
            httpOnly: true,
            path: '/',
            secure: this.configService.getOrThrow<string>('NODE_ENV') === 'production',
        });
        return { access_token };
    }

    @Post('register')
    async register(
        @Body() registerDto: RegisterDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { access_token } = await this.authService.register(registerDto);
        res.cookie('access_token', access_token, {
            httpOnly: true,
            path: '/',
            secure: this.configService.getOrThrow<string>('NODE_ENV') === 'production',
        });
        return { access_token };
    }

    @Post('logout')
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('access_token');
        return { message: 'Logged out successfully' };
    }
}
