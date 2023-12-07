import { Middleware } from 'grammy';

import { Context } from '../context';

export function userMiddleware(): Middleware<Context> {
  return async (context, next) => {
    const userId = context.from?.id;

    if (userId) {
      context.session.user = await context.services.user.getUserInfo(
        String(userId),
      );
    }

    await next();
  };
}
