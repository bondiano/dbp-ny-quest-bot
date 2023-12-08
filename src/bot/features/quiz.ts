import { Composer } from 'grammy';
import { Scene } from 'grammy-scenes';

import { chatAction } from '@grammyjs/auto-chat-action';

import { Context } from '@quiz-bot/bot/context';
import { logHandle } from '@quiz-bot/bot/helpers/logging';

import { scenes } from '../scenes';

export const QuizzesScene = 'quizzes';

const composer = new Composer<Context>();

const feature = composer.chatType('private');

feature.command(
  'quiz',
  logHandle('command-quizzes'),
  chatAction('typing'),
  async (context) => {
    await context.scenes.enter(QuizzesScene);
  },
);

export const quizzesScene = new Scene<Context>(QuizzesScene);
scenes.scene(quizzesScene);

quizzesScene.step(async (context) => {
  const quizzes = await context.services.quiz.getAvailableQuizzes();

  const quizzesCommands = quizzes
    .map(
      (quiz, index) =>
        `<b>${index + 1}.</b> /quiz_${quiz.slug} - <i>${quiz.title}</i>\n`,
    )
    .join('\n');

  await context.reply(
    context.t('quiz.list', {
      quizzes: quizzesCommands,
    }),
  );
});

export { composer as quizzesFeature };
