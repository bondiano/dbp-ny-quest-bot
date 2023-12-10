import { FastifyInstance } from 'fastify';
import { webhookCallback } from 'grammy';
import { nanoid } from 'nanoid';

import { Bot } from '@quiz-bot/bot/index.js';

export enum Routes {
  Webhook = 'webhook',
}

export const createRouter = async (app: FastifyInstance, bot: Bot) => {
  const webhookPath = `/wh-${nanoid()}`;

  app
    .get('/health', (_request, reply) => {
      return reply.status(200).send({ status: 'ok' });
    })
    .post(
      webhookPath,
      {
        name: Routes.Webhook,
      },
      webhookCallback(bot, 'fastify'),
    );
};
