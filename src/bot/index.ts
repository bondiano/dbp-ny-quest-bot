import { Bot as TelegramBot, session } from 'grammy';
import { pseudoUpdate } from 'grammy-pseudo-update';

import { autoChatAction } from '@grammyjs/auto-chat-action';
import { hydrate } from '@grammyjs/hydrate';
import { hydrateReply, parseMode } from '@grammyjs/parse-mode';

import { logger } from '@quiz-bot/logger';
import { prisma } from '@quiz-bot/prisma';
import { createServicesContainer } from '@quiz-bot/services/index';

import { config } from '../config';

import { createContextConstructor } from './context';
import {
  adminFeature,
  languageFeature,
  profileFeature,
  unhandledFeature,
  welcomeFeature,
} from './features';
import { quizzesFeature } from './features/quiz';
import { errorHandler } from './handlers/error';
import { PrismaAdapter } from './helpers/session-adapter';
import { i18n, isMultipleLocales } from './i18n';
import { updateLogger } from './middlewares/update-logger';
import { userMiddleware } from './middlewares/user';
import { scenes } from './scenes';
import { SessionData, initialSessionData } from './session';

export const createBot = () => {
  const bot = new TelegramBot(config.BOT_TOKEN, {
    ContextConstructor: createContextConstructor({
      logger,
      prisma,
      services: createServicesContainer(),
    }),
  });

  const protectedBot = bot.errorBoundary(errorHandler);

  bot.api.config.use(parseMode('HTML'));

  if (config.isDev) {
    protectedBot.use(updateLogger());
  }

  protectedBot.use(autoChatAction(bot.api));
  protectedBot.use(hydrateReply);
  protectedBot.use(hydrate());
  protectedBot.use(
    session({
      initial: initialSessionData,
      storage: new PrismaAdapter<SessionData>(),
    }),
  );
  protectedBot.use(i18n);
  protectedBot.use(scenes.manager());

  protectedBot.use(userMiddleware());
  protectedBot.use(pseudoUpdate);

  protectedBot.use(scenes);

  // Handlers
  protectedBot.use(welcomeFeature);
  protectedBot.use(adminFeature);
  protectedBot.use(profileFeature);
  protectedBot.use(quizzesFeature);

  if (isMultipleLocales) {
    protectedBot.use(languageFeature);
  }

  // must be the last handler
  protectedBot.use(unhandledFeature);

  return bot;
};

export type Bot = ReturnType<typeof createBot>;
