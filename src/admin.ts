import AdminJSFastify from '@adminjs/fastify';
import { Database, Resource, getModelByName } from '@adminjs/prisma';
import { FastifySessionOptions } from '@fastify/session';
import AdminJS, { ResourceWithOptions } from 'adminjs';
import { FastifyInstance } from 'fastify';

import { config } from '@quiz-bot/config.js';
import { prisma } from '@quiz-bot/prisma.js';

import { logger } from './logger.js';

const authenticate = async (email: string, password: string) => {
  if (email === config.ADMIN_EMAIL && password === config.ADMIN_PASSWORD) {
    return {
      email,
      password,
    };
  }
  return null;
};

export const attachAdminJS = async (app: FastifyInstance) => {
  AdminJS.registerAdapter({ Database, Resource });

  const resources: Array<ResourceWithOptions> = [
    {
      resource: { model: getModelByName('User'), client: prisma },
      options: {},
    },
    {
      resource: { model: getModelByName('Session'), client: prisma },
      options: {},
    },
    {
      resource: { model: getModelByName('Media'), client: prisma },
      options: {},
    },
    {
      resource: { model: getModelByName('MediaQuestion'), client: prisma },
      options: {},
    },
    {
      resource: { model: getModelByName('Answer'), client: prisma },
      options: {},
    },
    {
      resource: { model: getModelByName('Question'), client: prisma },
      options: {
        titleProperty: 'text',
      },
    },
    {
      resource: { model: getModelByName('Quiz'), client: prisma },
      options: {},
    },
    {
      resource: { model: getModelByName('QuizQuestion'), client: prisma },
      options: {},
    },
    {
      resource: { model: getModelByName('UserQuiz'), client: prisma },
      options: {},
    },
  ];

  const admin = new AdminJS({
    resources,
    rootPath: '/admin',
  });

  const sessionOptions: FastifySessionOptions = {
    secret: config.COOKIE_SECRET,
  };

  await AdminJSFastify.buildAuthenticatedRouter(
    admin,
    {
      authenticate,
      cookiePassword: config.COOKIE_SECRET,
      cookieName: 'adminjs',
    },
    app,
    sessionOptions,
  );

  logger.info(`AdminJS attached to ${admin.options.rootPath}`);
};
