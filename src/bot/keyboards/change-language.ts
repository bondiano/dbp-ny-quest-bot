import { InlineKeyboard } from 'grammy';
import ISO6391 from 'iso-639-1';
import _ from 'lodash';

import { changeLanguageData } from '../callback-data/change-language.js';
import { i18n } from '../i18n.js';

import type { Context } from '../context.js';

export const createChangeLanguageKeyboard = async (context: Context) => {
  const currentLocaleCode = await context.i18n.getLocale();

  const getLabel = (code: string) => {
    const isActive = code === currentLocaleCode;

    return `${isActive ? '✅ ' : ''}${ISO6391.getNativeName(code)}`;
  };

  return InlineKeyboard.from(
    _.chunk(
      i18n.locales.map((localeCode) => ({
        text: getLabel(localeCode),
        callback_data: changeLanguageData.pack({
          code: localeCode,
        }),
      })),
      2,
    ),
  );
};
