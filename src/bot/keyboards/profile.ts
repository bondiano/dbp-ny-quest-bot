import { InlineKeyboard } from 'grammy';

import { profileData } from '../callback-data/profile.js';

import type { Context } from '../context.js';

export enum ProfileKeyboardOptions {
  Answers = 'answers',
  ChangeLanguage = 'change-language',
  Quizzes = 'quizzes',
}

export const createProfileKeyboard = (context: Context) => {
  return InlineKeyboard.from([
    [
      {
        text: context.t('profile.answers'),
        callback_data: profileData.pack({
          option: ProfileKeyboardOptions.Answers,
        }),
      },
      {
        text: context.t('profile.change-language'),
        callback_data: profileData.pack({
          option: ProfileKeyboardOptions.ChangeLanguage,
        }),
      },
    ],
    [
      {
        text: context.t('profile.quizzes'),
        callback_data: profileData.pack({
          option: ProfileKeyboardOptions.Quizzes,
        }),
      },
    ],
  ]);
};
