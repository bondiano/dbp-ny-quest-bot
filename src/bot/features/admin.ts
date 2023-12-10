import { Composer } from 'grammy';
import _ from 'lodash';

import { chatAction } from '@grammyjs/auto-chat-action';

import { Context } from '../context.js';
import { isAdmin } from '../guards/is-admin.js';
import { setCommandsHandler } from '../handlers/commands/setcommands.js';
import { logHandle } from '../helpers/logging.js';

const composer = new Composer<Context>();

const feature = composer
  .chatType('private')
  .filter((context) => isAdmin(context));

feature.command(
  'setcommands',
  logHandle('command-setcommands'),
  chatAction('typing'),
  setCommandsHandler,
);

feature.command(
  'notify_about_quiz',
  logHandle('command-activate_quiz_question'),
  async (context) => {
    const slug = context.message.text.replace('/notify_about_quiz ', '');

    const quiz = await context.services.quiz.getQuizBySlug(slug);

    if (!quiz) {
      await context.reply(context.t('quiz.not-found'));
      return;
    }

    const telegramIds = _.uniq(
      quiz.participants.map((participant) => participant.user.telegramId),
    );

    const text = context.t('quiz.notify-about-quiz', {
      name: quiz.title,
      slug: quiz.slug,
    });

    await Promise.all(
      telegramIds.map(async (telegramId) => {
        return await context.api.sendMessage(telegramId, text);
      }),
    );
  },
);

export { composer as adminFeature };
