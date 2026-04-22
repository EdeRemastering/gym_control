import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      authz?: { where?: Record<string, unknown> };
    }>();

    if (!request.authz) {
      return true;
    }

    if (!request.authz.where) {
      throw new ForbiddenException('Ownership filter missing');
    }

    return true;
  }
}
