/**
 * Extended Express Request with authenticated user
 * Added by AuthGuard
 */
declare global {
  namespace Express {
    interface User {
      id: string;
      gymId: string;
      name: string;
      email: string | null;
    }

    interface Request {
      gymId?: string;
    }
  }
}

export interface UserPermissionsContext {
  userId: string;
  gymId: string;
  permissions: Set<string>;
  roles: string[];
}
