import { Composer } from 'grammy';

import { chatAction } from '@grammyjs/auto-chat-action';

import { Context } from '../context';
import { logHandle } from '../helpers/logging';

const composer = new Composer<Context>();

const feature = composer.chatType('private');

feature.command(
  'clear',
  logHandle('command-clear'),
  chatAction('typing'),
  async (context) => {
    await context.scenes.abort();
  },
);

export { composer as helpersFeature };
