import { Injectable } from '@nestjs/common';
import { AuthUserContext, OwnershipResolver } from './authorization.types';

@Injectable()
export class OwnershipRegistry {
  private readonly resolvers = new Map<string, OwnershipResolver>();

  constructor() {
    this.resolvers.set('membership', ({ user, gymId }) => ({
      ownWhere: {
        userId: user.id,
        gymId,
      },
      gymWhere: {
        gymId,
      },
    }));

    this.resolvers.set('user_routine', ({ user, gymId }) => ({
      ownWhere: {
        OR: [{ userId: user.id }, { assignedBy: user.id }],
        gymId,
      },
      gymWhere: {
        gymId,
      },
    }));
  }

  resolve(resource: string): OwnershipResolver | undefined {
    return this.resolvers.get(resource);
  }

  register(resource: string, resolver: OwnershipResolver): void {
    this.resolvers.set(resource, resolver);
  }

  buildDefault(user: AuthUserContext, gymId: string) {
    return {
      ownWhere: {
        userId: user.id,
        gymId,
      },
      gymWhere: {
        gymId,
      },
    };
  }
}
