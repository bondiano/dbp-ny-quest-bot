import { Middleware } from 'grammy';
import { performance } from 'node:perf_hooks';

import { Context } from '../context.js';
import { getUpdateInfo } from '../helpers/logging.js';

export function updateLogger(): Middleware<Context> {
  return async (context, next) => {
    context.api.config.use((previous, method, payload, signal) => {
      context.logger.debug({
        msg: 'bot api call',
        method,
        payload,
      });

      return previous(method, payload, signal);
    });

    context.logger.debug({
      msg: 'update received',
      update: getUpdateInfo(context),
    });

    const startTime = performance.now();
    try {
      await next();
    } finally {
      const endTime = performance.now();
      context.logger.debug({
        msg: 'update processed',
        duration: endTime - startTime,
      });
    }
  };
}
