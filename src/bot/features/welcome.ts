import { Composer } from 'grammy';

import { chatAction } from '@grammyjs/auto-chat-action';

import { Context } from '@quiz-bot/bot/context';
import { logHandle } from '@quiz-bot/bot/helpers/logging';

import { OnboardingScene } from './onboarding';

const composer = new Composer<Context>();

const feature = composer.chatType('private');

feature.command(
  'start',
  logHandle('command-start'),
  chatAction('typing'),
  async (context) => {
    await context.reply(context.t('welcome'));

    if (!context.session.user) {
      await context.scenes.enter(OnboardingScene);
    }
  },
);

export { composer as welcomeFeature };
