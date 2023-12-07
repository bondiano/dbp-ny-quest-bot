import { Composer } from 'grammy';

import { changeLanguageData } from '../callback-data';
import { Context } from '../context';
import { logHandle } from '../helpers/logging';
import { i18n } from '../i18n';
import { createChangeLanguageKeyboard } from '../keyboards/change-language';

const composer = new Composer<Context>();

const feature = composer.chatType('private');

feature.command('language', logHandle('command-language'), async (context) => {
  return await context.reply(context.t('language.select'), {
    reply_markup: await createChangeLanguageKeyboard(context),
  });
});

feature.callbackQuery(
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

    return await context.editMessageText(context.t('language.changed'), {
      reply_markup: await createChangeLanguageKeyboard(context),
    });
  },
);

export { composer as languageFeature };
