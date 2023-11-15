import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { UserWithInfo } from '../modules/database/select/user.select';

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserWithInfo;
  },
);
