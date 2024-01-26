import { Composer } from 'grammy';

import { Context } from '@quiz-bot/bot/context.js';
import { logHandle } from '@quiz-bot/bot/helpers/logging.js';

import { profileData } from '../callback-data/profile.js';
import {
  ProfileKeyboardOptions,
  createProfileKeyboard,
} from '../keyboards/profile.js';

import { AnswersScene } from './answers.js';
import { LanguageScene } from './language.js';
import { QuizzesScene } from './quiz.js';

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
        return await context.scenes.enter(AnswersScene);
      }
    }
  },
);

export { composer as profileFeature };
