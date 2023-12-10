import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';
import { Scene } from 'grammy-scenes';

import { chatAction } from '@grammyjs/auto-chat-action';

import { Context } from '@quiz-bot/bot/context.js';

import { scenes } from '../scenes.js';

export const OnboardingScene = 'onboarding';

const dualbootEmailDomain = 'dualbootpartners.com';

export const onboardingScene = new Scene<Context>(OnboardingScene);
scenes.scene(onboardingScene);

onboardingScene.always().do(chatAction('typing'));

onboardingScene.step(async (context) => {
  await context.reply(context.t('onboarding.email'));
});

onboardingScene.wait('email').on('message', async (context) => {
  const email = context.message.text;

  if (!email?.endsWith(dualbootEmailDomain)) {
    return await context.reply(context.t('onboarding.email-invalid'));
  }

  try {
    context.session.user = await context.services.user.createUser(
      String(context.from.id),
      email,
    );
    context.scene.resume();
  } catch (error) {
    if (!(error instanceof PrismaClientKnownRequestError)) {
      context.logger.error(error);
      return await context.reply(context.t('onboarding.email-invalid'));
    }

    if (error.code === 'P2002') {
      return await context.reply(context.t('onboarding.email-exists'));
    }
  }
});

onboardingScene.step(async (context) => {
  await context.reply(context.t('onboarding.name'));
});

onboardingScene.wait('name').on('message', async (context) => {
  const name = context.message.text;

  if (!name) {
    return await context.reply(context.t('onboarding.name-invalid'));
  }

  context.session.user = await context.services.user.updateUser(
    context.session.user!.id,
    {
      slackName: name,
    },
  );

  await context.reply(context.t('onboarding.done', { name }));

  context.scene.exit();
});
