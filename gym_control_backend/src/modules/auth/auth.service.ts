import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';

/**
 * AuthService
 * Core authentication business logic
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        gymId: dto.gymId,
        email: dto.email,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException('Email already registered in this gym');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        gymId: dto.gymId,
        name: dto.name,
        email: dto.email,
        passwordHash,
      },
      select: {
        id: true,
        gymId: true,
        name: true,
        email: true,
      },
    });

    const tokens = await this.issueTokens(user.id, user.gymId);
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        deletedAt: null,
      },
      select: {
        id: true,
        gymId: true,
        name: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens(user.id, user.gymId);
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        gymId: user.gymId,
        name: user.name,
        email: user.email,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    const user = await this.prisma.user.findFirst({
      where: { id: dto.userId, deletedAt: null },
      select: {
        id: true,
        gymId: true,
        name: true,
        email: true,
        refreshTokenHash: true,
      },
    });

    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isValidRefresh = await bcrypt.compare(
      dto.refreshToken,
      user.refreshTokenHash,
    );
    if (!isValidRefresh) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.issueTokens(user.id, user.gymId);
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        gymId: user.gymId,
        name: user.name,
        email: user.email,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        gymId: true,
        name: true,
        email: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
    return { success: true };
  }

  private async issueTokens(userId: string, gymId: string) {
    const payload = { sub: userId, gymId };
    const expiresInRaw = this.configService.get<string>(
      'JWT_EXPIRES_IN',
      '24h',
    );
    const refreshExpiresInRaw = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '7d',
    );
    const expiresIn = this.parseExpiresInSeconds(expiresInRaw);
    const refreshExpiresIn = this.parseExpiresInSeconds(refreshExpiresInRaw);

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private async storeRefreshTokenHash(userId: string, refreshToken: string) {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }

  private parseExpiresInSeconds(expiresIn: string): number {
    if (expiresIn.endsWith('h')) {
      return Number(expiresIn.replace('h', '')) * 3600;
    }
    if (expiresIn.endsWith('d')) {
      return Number(expiresIn.replace('d', '')) * 86400;
    }
    if (expiresIn.endsWith('m')) {
      return Number(expiresIn.replace('m', '')) * 60;
    }
    return Number(expiresIn);
  }
}
