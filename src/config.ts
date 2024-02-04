import 'dotenv/config';
import { API_CONSTANTS } from 'grammy';
import { z, port, parseEnv } from 'znv';

export enum Environment {
  Development = 'development',
  Production = 'production',
}

export const configSchema = {
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'])
    .default('info'),
  ENVIRONMENT: z
    .enum([Environment.Development, Environment.Production])
    .default(Environment.Development),

  BOT_TOKEN: z.string(),
  BOT_DOMAIN: z.string().default('0.0.0.0'),
  BOT_ALLOWED_UPDATES: z
    .array(z.enum(API_CONSTANTS.ALL_UPDATE_TYPES))
    .default([]),

  SERVER_PORT: port(),
  SERVER_HOST: z.string().default('0.0.0.0'),

  ADMIN_EMAIL: z.string(),
  ADMIN_PASSWORD: z.string(),

  COOKIE_SECRET: z.string().min(32),

  GPT_TOKEN: z.string(),
} as const;

const environmentVariables = parseEnv(process.env, configSchema);

export const config = {
  ...environmentVariables,
  isDev: environmentVariables.ENVIRONMENT === Environment.Development,
  isProd: environmentVariables.ENVIRONMENT === Environment.Production,
} as const;

export type Config = typeof config;
