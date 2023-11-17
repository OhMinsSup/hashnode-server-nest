import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { UserWithInfo } from '../modules/database/prisma.interface';

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserWithInfo;
  },
);
