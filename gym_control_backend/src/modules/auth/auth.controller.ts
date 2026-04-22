import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';
import { Public } from '../rbac/rbac.decorators';
import { CurrentAuthUser } from './current-auth-user.decorator';

/**
 * AuthController
 * Handles HTTP requests for authentication
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Public()
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh-token')
  @Public()
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @Get('me')
  me(
    @CurrentAuthUser()
    user?: {
      id: string;
      gymId: string;
      name: string;
      email: string | null;
    },
  ) {
    if (!user?.id) {
      throw new UnauthorizedException('Missing authenticated user');
    }
    return this.authService.me(user.id);
  }

  @Post('logout')
  logout(
    @CurrentAuthUser()
    user?: {
      id: string;
      gymId: string;
      name: string;
      email: string | null;
    },
  ) {
    if (!user?.id) {
      throw new UnauthorizedException('Missing authenticated user');
    }
    return this.authService.logout(user.id);
  }
}
