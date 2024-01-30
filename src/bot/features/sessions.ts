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
  const telegramId =
    context.session.user?.telegramId ?? context.from?.id ?? 'no user';

  await context.reply(String(telegramId));
});

export { composer as sessionsFeature };
