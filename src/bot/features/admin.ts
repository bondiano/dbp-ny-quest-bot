import { Composer } from 'grammy';

import { chatAction } from '@grammyjs/auto-chat-action';

import { Context } from '../context';
import { isAdmin } from '../guards/is-admin';
import { setCommandsHandler } from '../handlers/commands/setcommands';
import { logHandle } from '../helpers/logging';

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

feature.command('start_quiz', logHandle('command-start_quiz'));

feature.command(
  'activate_quiz_question',
  logHandle('command-activate_quiz_question'),
);

export { composer as adminFeature };
