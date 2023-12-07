import { InlineKeyboard } from 'grammy';

import { profileData } from '../callback-data';

import type { Context } from '../context';

export const createProfileKeyboard = async (context: Context) => {
  return InlineKeyboard.from([
    [
      {
        text: context.t('profile.answers'),
        callback_data: profileData.pack({
          option: 'answers',
        }),
      },
      {
        text: context.t('profile.change-language'),
        callback_data: profileData.pack({
          option: 'change-language',
        }),
      },
    ],
    [
      {
        text: context.t('profile.quizzes'),
        callback_data: profileData.pack({
          option: 'quizzes',
        }),
      },
    ],
  ]);
};
