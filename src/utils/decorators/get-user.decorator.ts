import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDocument } from '../../user/shema/user.schema';

export const GetUser = createParamDecorator(
  (_data, ctx: ExecutionContext): UserDocument => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
