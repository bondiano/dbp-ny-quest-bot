import { Composer } from 'grammy';
import { Scene } from 'grammy-scenes';

import { changeLanguageData } from '../callback-data/change-language.js';
import { Context } from '../context.js';
import { logHandle } from '../helpers/logging.js';
import { i18n } from '../i18n.js';
import { createChangeLanguageKeyboard } from '../keyboards/change-language.js';
import { scenes } from '../scenes.js';

export const LanguageScene = 'language';

const composer = new Composer<Context>();

const feature = composer.chatType('private');

feature.command('language', logHandle('command-language'), async (context) => {
  return await context.scenes.enter(LanguageScene);
});

export const languageScene = new Scene<Context>(LanguageScene);
scenes.scene(languageScene);

languageScene.step(async (context) => {
  return await context.reply(context.t('language.select'), {
    reply_markup: await createChangeLanguageKeyboard(context),
  });
});

languageScene
  .wait('change_language')
  .callbackQuery(
    changeLanguageData.filter(),
    logHandle('keyboard-language-select'),
    async (context) => {
      const { code: languageCode } = changeLanguageData.unpack(
        context.callbackQuery.data,
      );

      if (!i18n.locales.includes(languageCode)) {
        return await context.answerCallbackQuery(
          context.t('language.unknown', { languageCode }),
        );
      }

      await context.i18n.setLocale(languageCode);

      if (context.session.user) {
        context.session.user.language = languageCode;
        await context.services.user.updateUser(context.session.user.id, {
          language: languageCode,
        });
      }

      await context.editMessageText(context.t('language.changed'));

      await context.scene.exit();
    },
  );

export { composer as languageFeature };
