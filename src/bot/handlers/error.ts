import { ErrorHandler } from 'grammy';

import { getUpdateInfo } from '../helpers/logging';

import type { Context } from '../context';

export const errorHandler: ErrorHandler<Context> = (error) => {
  const { ctx } = error;

  ctx.logger.error({
    err: error.error,
    update: getUpdateInfo(ctx),
  });
};
