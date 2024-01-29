import { Composer } from 'grammy';

import { Context } from '../context.js';
import { logHandle } from '../helpers/logging.js';
import { initialSessionData } from '../session.js';

const composer = new Composer<Context>();

const feature = composer.chatType('private');

feature.command(
  'clear_session',
  logHandle('command-clear_session'),
  async (context) => {
    context.session = initialSessionData();

    await context.reply(context.t('session.clear'));
  },
);

feature.command('session', logHandle('command-session'), async (context) => {
  await context.reply(context.session.user?.telegramId ?? 'no user');
});

export { composer as sessionsFeature };
