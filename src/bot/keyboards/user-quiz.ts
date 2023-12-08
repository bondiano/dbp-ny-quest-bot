import { UserQuiz } from '@prisma/client';
import { InlineKeyboard } from 'grammy';

import { quizData } from '../callback-data';

import type { Context } from '../context';

export enum QuizKeyboardOptions {
  Start = 'start',
  Continue = 'continue',
  Stop = 'stop',
}

export const createUserQuizKeyboard = async (
  context: Context,
  userQuiz: UserQuiz | null,
) => {
  const isUserQuizActive = Boolean(userQuiz);

  if (isUserQuizActive) {
    return InlineKeyboard.from([
      [
        {
          text: context.t('quiz.continue'),
          callback_data: quizData.pack({
            option: QuizKeyboardOptions.Continue,
          }),
        },
        {
          text: context.t('quiz.stop'),
          callback_data: quizData.pack({
            option: QuizKeyboardOptions.Stop,
          }),
        },
      ],
    ]);
  }

  return InlineKeyboard.from([
    [
      {
        text: context.t('quiz.start'),
        callback_data: quizData.pack({
          option: QuizKeyboardOptions.Start,
        }),
      },
    ],
  ]);
};
