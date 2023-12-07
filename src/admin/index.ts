// @ts-expect-error - adminjs requires NodeNext modules
import { Database, Resource, getModelByName } from '@adminjs/prisma';
import AdminJS from 'adminjs';

import { prisma } from '@quiz-bot/prisma';

export const createAdmin = () => {
  AdminJS.registerAdapter({ Database, Resource });

  const resources = [
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
      resource: { model: getModelByName('Answer'), client: prisma },
      options: {},
    },
    {
      resource: { model: getModelByName('Question'), client: prisma },
      options: {},
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

  return new AdminJS({
    resources,
    rootPath: '/admin',
  });
};
