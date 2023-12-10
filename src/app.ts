import Fastify from 'fastify';
import { onShutdown } from 'node-graceful-shutdown';

import { attachAdminJS } from './admin.js';
import { createBot } from './bot/index.js';
import { config } from './config.js';
import { logger } from './logger.js';
import { reversePlugin } from './plugins/fastify-reverse-routes.js';
import { Routes, createRouter } from './routes/index.js';

export const createApp = async () => {
  const app = Fastify();

  await attachAdminJS(app);

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
    port: config.SERVER_PORT,
    host: config.SERVER_HOST,
  });

  const webhookPath = app.reverse(Routes.Webhook);
  const webhookUrl = `${config.BOT_DOMAIN}${webhookPath}`;

  await bot.api.setWebhook(webhookUrl, {
    allowed_updates: config.BOT_ALLOWED_UPDATES,
  });
  logger.debug(`Webhook set to ${webhookUrl}`);

  logger.info(`Server listening on ${config.SERVER_PORT}`);

  return await app;
};
