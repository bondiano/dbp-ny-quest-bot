import { Composer } from 'grammy';
import { Scene } from 'grammy-scenes';

import { Context } from '@quiz-bot/bot/context';
import { logHandle } from '@quiz-bot/bot/helpers/logging';

export const ProfileScene = 'onboarding';

const composer = new Composer<Context>();

const feature = composer.chatType('private');

feature.command('profile', logHandle('command-profile'), async (context) => {
  await context.reply(context.t('profile'));
});

export const profileScene = new Scene<Context>(ProfileScene);

export { composer as profileFeature };
