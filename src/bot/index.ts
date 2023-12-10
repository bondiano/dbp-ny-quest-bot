import { Bot as TelegramBot, session } from 'grammy';
import { pseudoUpdate } from 'grammy-pseudo-update';

import { autoChatAction } from '@grammyjs/auto-chat-action';
import { hydrate } from '@grammyjs/hydrate';
import { hydrateReply, parseMode } from '@grammyjs/parse-mode';

import { logger } from '@quiz-bot/logger.js';
import { prisma } from '@quiz-bot/prisma.js';
import { createServicesContainer } from '@quiz-bot/services/index.js';

import { config } from '../config.js';

import { createContextConstructor } from './context.js';
import { helpersFeature } from './features/helpers.js';
import {
  adminFeature,
  languageFeature,
  profileFeature,
  unhandledFeature,
  welcomeFeature,
} from './features/index.js';
import { quizzesFeature } from './features/quiz.js';
import { userQuizzesFeature } from './features/user-quiz.js';
import { errorHandler } from './handlers/error.js';
import { PrismaAdapter } from './helpers/session-adapter.js';
import { i18n, isMultipleLocales } from './i18n.js';
import { updateLogger } from './middlewares/update-logger.js';
import { userMiddleware } from './middlewares/user.js';
import { scenes } from './scenes.js';
import { SessionData, initialSessionData } from './session.js';

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
  protectedBot.use(helpersFeature);

  protectedBot.use(scenes);

  // Handlers
  protectedBot.use(welcomeFeature);
  protectedBot.use(adminFeature);
  protectedBot.use(profileFeature);
  protectedBot.use(quizzesFeature);
  protectedBot.use(userQuizzesFeature);

  if (isMultipleLocales) {
    protectedBot.use(languageFeature);
  }

  // must be the last handler
  protectedBot.use(unhandledFeature);

  return bot;
};

export type Bot = ReturnType<typeof createBot>;
