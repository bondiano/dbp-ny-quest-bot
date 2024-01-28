import { Composer } from 'grammy';
import { Scene } from 'grammy-scenes';
import _ from 'lodash';

import { chatAction } from '@grammyjs/auto-chat-action';

import { Context } from '../context.js';
import { isAdmin } from '../guards/is-admin.js';
import { setCommandsHandler } from '../handlers/commands/setcommands.js';
import { logHandle } from '../helpers/logging.js';
import { scenes } from '../scenes.js';

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

feature.command(
  'notify_about_quiz',
  logHandle('command-notify_about_quiz'),
  async (context) => {
    const slug = context.message.text.replace('/notify_about_quiz', '').trim();

    const quiz = await context.services.quiz.getQuizBySlug(slug);

    if (!quiz) {
      await context.reply(context.t('quiz.not-found'));
      return;
    }

    const telegramIds = _.uniq(
      quiz.participants.map((participant) => participant.user.telegramId),
    );

    const text = context.t('quiz.notify-about-quiz', {
      name: quiz.title,
      slug: quiz.slug,
    });

    await Promise.all(
      telegramIds.map(async (telegramId) => {
        return await context.api.sendMessage(telegramId, text);
      }),
    );
  },
);

feature.command('media', async (context) => {
  const id = context.message.text.replace('/media', '').trim();

  if (!id) {
    await context.scenes.enter(UploadMediaScene);
    return;
  }

  const media = await context.services.media.getMediaById(Number(id));

  if (!media) {
    await context.reply(context.t('media.not-found'));
    return;
  }

  await context.replyWithMediaGroup([
    {
      media: media.telegramMediaId,
      type: media.telegramMediaType as 'photo' | 'audio' | 'document' | 'video',
      caption: `media id: ${media.id}\ntelegram media id: ${media.telegramMediaId}\ntype: ${media.telegramMediaType}`,
    },
  ]);
});

const UploadMediaScene = 'upload-media';
const uploadMediaScene = new Scene<Context>(UploadMediaScene);
scenes.scene(uploadMediaScene);

uploadMediaScene.step(async (context) => {
  await context.reply('Send me a photo or a video');
});

uploadMediaScene.wait('media').on(':media', async (context) => {
  if (!context.message) {
    await context.reply('Send me a photo or a video, or a audio');
    return;
  }

  const photo = context.message.photo;
  const video = context.message.video;
  const audio = context.message.audio;

  if (!photo && !video && !audio) {
    await context.reply('Send me a photo or a video, or a audio');
    return;
  }

  let type: 'photo' | 'video' | 'audio' = 'photo';

  switch (true) {
    case Boolean(photo): {
      type = 'photo';
      break;
    }
    case Boolean(video): {
      type = 'video';
      break;
    }
    case Boolean(audio): {
      type = 'audio';
      break;
    }
  }

  let mediaId: string | undefined;

  switch (type) {
    case 'photo': {
      const mediaContent = context.message.photo!;
      const maxPhotoSize = _.head(_.sortBy(mediaContent, 'file_size'));

      mediaId = maxPhotoSize?.file_id;
      break;
    }
    case 'video': {
      const mediaContent = context.message.video!;
      mediaId = mediaContent.file_id;

      break;
    }
    case 'audio': {
      const mediaContent = context.message.audio!;
      mediaId = mediaContent.file_id;

      break;
    }
  }

  if (!mediaId) {
    await context.reply('No such media');
    return;
  }

  const media = await context.services.media.saveMedia({
    mediaId,
    type,
  });

  await context.reply(
    `Media created, media id: ${media.id}\ntelegram media id: <pre>${media.telegramMediaId}</pre>\ntype: ${media.telegramMediaType}`,
  );

  await context.scene.exit();
});

export { composer as adminFeature };
