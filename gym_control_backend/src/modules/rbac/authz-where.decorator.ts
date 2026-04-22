import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthzWhere = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ authz?: { where?: Record<string, unknown> } }>();
    return request.authz?.where ?? {};
  },
);
