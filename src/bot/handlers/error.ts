import { ErrorHandler } from 'grammy';

import { getUpdateInfo } from '../helpers/logging.js';

import type { Context } from '../context.js';

export const errorHandler: ErrorHandler<Context> = (error) => {
  const { ctx } = error;

  ctx.logger.error({
    err: error.error,
    update: getUpdateInfo(ctx),
  });
};
