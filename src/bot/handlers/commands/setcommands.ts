import { CommandContext } from 'grammy';
import { Message } from 'grammy/types';

import { BotCommand } from '@grammyjs/types';

import { i18n, isMultipleLocales } from '@quiz-bot/bot/i18n.js';

import type { Context } from '@quiz-bot/bot/context.js';

function getLanguageCommand(localeCode: string): BotCommand {
  return {
    command: 'language',
    description: i18n.t(localeCode, 'language_command.description'),
  };
}

function getPrivateChatCommands(localeCode: string): Array<BotCommand> {
  return [
    {
      command: 'start',
      description: i18n.t(localeCode, 'start_command.description'),
    },
    {
      command: 'profile',
      description: i18n.t(localeCode, 'profile_command.description'),
    },
    {
      command: 'language',
      description: i18n.t(localeCode, 'language_command.description'),
    },
  ];
}

function getPrivateChatAdminCommands(localeCode: string): Array<BotCommand> {
  return [
    {
      command: 'setcommands',
      description: i18n.t(localeCode, 'setcommands_command.description'),
    },
  ];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getGroupChatCommands(localeCode: string): Array<BotCommand> {
  return [];
}

export async function setCommandsHandler(
  context: CommandContext<Context>,
): Promise<Message> {
  const DEFAULT_LANGUAGE_CODE = 'en';

  // set private chat commands
  await context.api.setMyCommands(
    [
      ...getPrivateChatCommands(DEFAULT_LANGUAGE_CODE),
      ...(isMultipleLocales ? [getLanguageCommand(DEFAULT_LANGUAGE_CODE)] : []),
    ],
    {
      scope: {
        type: 'all_private_chats',
      },
    },
  );

  if (isMultipleLocales) {
    const requests = i18n.locales.map((code) =>
      context.api.setMyCommands(
        [
          ...getPrivateChatCommands(code),
          ...(isMultipleLocales
            ? [getLanguageCommand(DEFAULT_LANGUAGE_CODE)]
            : []),
        ],
        {
          language_code: code,
          scope: {
            type: 'all_private_chats',
          },
        },
      ),
    );

    await Promise.all(requests);
  }

  // set group chat commands
  await context.api.setMyCommands(getGroupChatCommands(DEFAULT_LANGUAGE_CODE), {
    scope: {
      type: 'all_group_chats',
    },
  });

  if (isMultipleLocales) {
    const requests = i18n.locales.map((code) =>
      context.api.setMyCommands(getGroupChatCommands(code), {
        language_code: code,
        scope: {
          type: 'all_group_chats',
        },
      }),
    );

    await Promise.all(requests);
  }

  const adminId = await context.session.user?.id;

  // set private chat commands for owner
  await context.api.setMyCommands(
    [
      ...getPrivateChatCommands(DEFAULT_LANGUAGE_CODE),
      ...getPrivateChatAdminCommands(DEFAULT_LANGUAGE_CODE),
      ...(isMultipleLocales ? [getLanguageCommand(DEFAULT_LANGUAGE_CODE)] : []),
    ],
    {
      scope: {
        type: 'chat',
        chat_id: Number(adminId),
      },
    },
  );

  return await context.reply(context.t('admin.commands-updated'));
}
