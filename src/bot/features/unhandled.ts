import { Composer } from 'grammy';

import { Context } from '../context';
import { logHandle } from '../helpers/logging';

const composer = new Composer<Context>();

const feature = composer.chatType('private');

feature.on('::bot_command', logHandle('unhandled-message'), (context) => {
  return context.reply(context.t('unhandled'));
});

feature.on(
  'callback_query',
  logHandle('unhandled-callback-query'),
  (context) => {
    return context.answerCallbackQuery();
  },
);

export { composer as unhandledFeature };
