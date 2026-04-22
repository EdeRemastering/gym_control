import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PermissionsGuard } from './permissions.guard';
import { OwnershipGuard } from './ownership.guard';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly permissionsGuard: PermissionsGuard,
    private readonly ownershipGuard: OwnershipGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const phaseOne = await this.permissionsGuard.canActivate(context);
    if (!phaseOne) {
      return false;
    }

    return this.ownershipGuard.canActivate(context);
  }
}
