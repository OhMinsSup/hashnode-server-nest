import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SerializeUser } from '../integrations/serialize/serialize.interface';

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as SerializeUser;
  },
);
