import { Middleware } from 'grammy';
import _ from 'lodash';

import type { Update } from '@grammyjs/types';

import type { Context } from '../context.js';

export function getUpdateInfo(context: Context): Omit<Update, 'update_id'> {
  return _.omit(context.update, ['update_id']);
}

export function logHandle<Context_ extends Context>(
  id: string,
): Middleware<Context_> {
  return (context, next) => {
    context.logger.info({
      msg: `handle ${id}`,
      ...(id.startsWith('unhandled') ? { update: getUpdateInfo(context) } : {}),
    });

    return next();
  };
}
