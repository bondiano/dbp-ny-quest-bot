// @ts-expect-error - adminjs requires NodeNext modules
import AdminJSFastify from '@adminjs/fastify';
import Fastify from 'fastify';
import { onShutdown } from 'node-graceful-shutdown';

import { createAdmin } from './admin';
import { createBot } from './bot';
import { config } from './config';
import { logger } from './logger';
import { reversePlugin } from './plugins/fastify-reverse-routes';
import { Routes, createRouter } from './routes';

export const createApp = async () => {
  const app = Fastify();
  const admin = createAdmin();

  await AdminJSFastify.buildRouter(admin, app);

  const bot = createBot();

  if (!config.isDev) {
    onShutdown(async () => {
      logger.info('shutdown');

      await app.close();
      await bot.stop();
    });
  }

  await app.register(reversePlugin);

  createRouter(app, bot);

  app.setErrorHandler(async (error, request, response) => {
    logger.error(error);

    await response.status(500).send({ error: 'Oops! Something went wrong.' });
  });

  await bot.init();

  await app.listen({
    port: config.BOT_SERVER_PORT,
  });

  const webhookPath = app.reverse(Routes.Webhook);
  const webhookUrl = `${config.BOT_SERVER_HOST}${webhookPath}`;

  await bot.api.setWebhook(webhookUrl, {
    allowed_updates: config.BOT_ALLOWED_UPDATES,
  });
  logger.debug(`Webhook set to ${webhookUrl}`);

  return await app;
};
