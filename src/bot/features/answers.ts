import { Composer } from 'grammy';
import { Scene } from 'grammy-scenes';

import { br2nl } from '@quiz-bot/utils.js';

import { Context } from '../context.js';
import { logHandle } from '../helpers/logging.js';
import { scenes } from '../scenes.js';

export const AnswersScene = 'answers';

const composer = new Composer<Context>();

const feature = composer.chatType('private');

feature.command('answers', logHandle('command-answers'), async (context) => {
  return await context.scenes.enter(AnswersScene);
});

export const answersScene = new Scene<Context>(AnswersScene);
scenes.scene(answersScene);

answersScene.step(async (context) => {
  const { user } = context.session;

  if (!user) {
    await context.reply(context.t('profile.not-found'));
    await context.scene.exit();
    return;
  }

  const answers = await context.services.answer.getUserAnswers(user.id);

  if (!answers?.length) {
    await context.reply(context.t('answers.empty'));
    await context.scene.exit();
    return;
  }

  const answersText = answers
    .map((answer) => {
      const { question, answer: answerText, isCorrect } = answer;

      const questionText = br2nl(question.text);

      const answerTextWithEmoji = isCorrect
        ? `✅ ${answerText}`
        : `❌ ${answerText}`;

      return `${questionText}\n${answerTextWithEmoji}`;
    })
    .join('\n');

  await context.reply(context.t('answers.list', { answers: answersText }));
  await context.scene.exit();
});
