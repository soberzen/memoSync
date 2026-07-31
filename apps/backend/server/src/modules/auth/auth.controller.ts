import type { Response, Request } from 'express';

import { AuthGuard } from '@nestjs/passport';
import { Body, Controller, Post, UseGuards, Res, Req } from '@nestjs/common';
import { UserEntity } from '@/entities/user';

import { Public } from '@/decorators/public.decorator';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(
    @Req() req: { user: UserEntity },
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, refreshToken } = await this.authService.login(
      req.user
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return {
      accessToken,
    };
  }

  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() req: Request & { cookies: { refreshToken: string } },
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies.refreshToken;
    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refresh({ refreshToken });
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return {
      accessToken,
    };
  }

  @Post('logout')
  async logout(
    @Req() req: Request & { cookies: { refreshToken: string } },
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies.refreshToken;
    await this.authService.logout({ refreshToken });

    res.clearCookie('refreshToken');

    return null;
  }
}
