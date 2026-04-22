import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentAuthUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{
      user?: { id: string; gymId: string; name: string; email: string | null };
    }>();
    return request.user;
  },
);
