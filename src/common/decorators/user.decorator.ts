import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = (data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  const user = request.user;

  return data ? user && user[data] : user;
};

export const UserDecorator = createParamDecorator(User);
