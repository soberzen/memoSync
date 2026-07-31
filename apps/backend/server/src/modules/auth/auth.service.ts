import { createHash, randomUUID } from 'node:crypto';

import { UserEntity } from '@/entities/user';
import { RefreshTokenEntity } from '@/entities/refresh-token';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { IsNull, MoreThan, Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { JwtPayload } from './type/jwt-payload';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>
  ) {}

  async validateUser(
    email: string,
    password: string
  ): Promise<UserEntity | null> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      return null;
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, password);

    if (!isPasswordValid) {
      return null;
    }
    return user;
  }

  async validateJwtPayload(payload: JwtPayload): Promise<UserEntity | null> {
    return this.userRepository.findOneBy({
      id: payload.sub,
    });
  }

  // 登陆
  async login(user: UserEntity) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    await this.refreshTokenRepository.save({
      sessionId: randomUUID(),
      userId: user.id,
      tokenHash: this.hashToken(refreshToken),
      expiresAt: this.addDays(7),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  // 注册用户
  async register(registerDto: RegisterDto) {
    const { email, password, name, avatarUrl } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const hashedPassword = await argon2.hash(password);
    const user = this.userRepository.create({
      email,
      passwordHash: hashedPassword,
      name,
      avatarUrl,
    });
    const savedUser = await this.userRepository.save(user);

    return {
      name: savedUser.name,
      email: savedUser.email,
      avatarUrl: savedUser.avatarUrl,
    };
  }

  // 刷新token
  async refresh(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    const tokenHash = this.hashToken(refreshToken);
    const storedRefreshToken = await this.refreshTokenRepository.findOne({
      where: {
        tokenHash,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!storedRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepository.findOneBy({
      id: storedRefreshToken.userId,
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const accessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);
    const newStoredRefreshToken = await this.refreshTokenRepository.save({
      sessionId: storedRefreshToken.sessionId,
      userId: user.id,
      tokenHash: this.hashToken(newRefreshToken),
      expiresAt: this.addDays(7),
    });

    const usedAt = new Date();
    await this.refreshTokenRepository.update(storedRefreshToken.id, {
      revokedAt: usedAt,
      lastUsedAt: usedAt,
      replacedByTokenId: newStoredRefreshToken.id,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  // 退出登录
  async logout(refreshTokenDto: RefreshTokenDto) {
    const tokenHash = this.hashToken(refreshTokenDto.refreshToken);
    const storedRefreshToken = await this.refreshTokenRepository.findOne({
      where: {
        tokenHash,
        revokedAt: IsNull(),
      },
    });

    if (!storedRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const usedAt = new Date();
    await this.refreshTokenRepository.update(storedRefreshToken.id, {
      revokedAt: usedAt,
      lastUsedAt: usedAt,
    });
  }

  private generateAccessToken(user: UserEntity): string {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.sign(payload, { expiresIn: '15m' });
  }

  private generateRefreshToken(user: UserEntity): string {
    const payload = { sub: user.id };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private addDays(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }
}
