import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * AuthGuard
 * Simple JWT/token validation
 * In production, use @nestjs/passport with JWT strategy
 *
 * This is a placeholder that should be replaced with proper JWT validation
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Missing authorization header');
    }
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        gymId: string;
      }>(token, { secret: this.configService.get<string>('JWT_SECRET') });

      const user = await this.prisma.user.findFirst({
        where: {
          id: payload.sub,
          gymId: payload.gymId,
          deletedAt: null,
        },
        select: { id: true, gymId: true, name: true, email: true },
      });
      if (!user) {
        throw new UnauthorizedException('Invalid token user');
      }
      request.user = user;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }
}
