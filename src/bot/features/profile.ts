import { Composer } from 'grammy';

import { Context } from '@quiz-bot/bot/context';
import { logHandle } from '@quiz-bot/bot/helpers/logging';

import { profileData } from '../callback-data';
import {
  ProfileKeyboardOptions,
  createProfileKeyboard,
} from '../keyboards/profile';

import { LanguageScene } from './language';
import { QuizzesScene } from './quiz';

const composer = new Composer<Context>();

const feature = composer.chatType('private');

feature.command('profile', logHandle('command-profile'), async (context) => {
  await context.reply(
    context.t('profile.message', {
      name: context.session.user?.slackName ?? 'unknown',
    }),
    { reply_markup: createProfileKeyboard(context) },
  );
});

feature.callbackQuery(
  profileData.filter(),
  logHandle('keyboard-profile'),
  async (context) => {
    const { option } = profileData.unpack(context.callbackQuery.data);

    await context.editMessageText(
      context.t('profile.message', {
        name: context.session.user?.slackName ?? 'unknown',
      }),
    );

    switch (option) {
      case ProfileKeyboardOptions.Quizzes: {
        return await context.scenes.enter(QuizzesScene);
      }
      case ProfileKeyboardOptions.ChangeLanguage: {
        return await context.scenes.enter(LanguageScene);
      }
      case ProfileKeyboardOptions.Answers: {
        return; // TODO
      }
    }
  },
);

export { composer as profileFeature };
