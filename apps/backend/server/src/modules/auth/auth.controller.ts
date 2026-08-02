import type { Response, Request } from 'express';

import { AuthGuard } from '@nestjs/passport';
import { Body, Controller, Post, UseGuards, Res, Req } from '@nestjs/common';
import { UserEntity } from '@/entities/user';

import { Public } from '@/decorators/public.decorator';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from './utils/refresh-token-cookie.util';

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
    setRefreshTokenCookie(res, refreshToken);
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
    setRefreshTokenCookie(res, newRefreshToken);
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

    clearRefreshTokenCookie(res);

    return null;
  }
}
