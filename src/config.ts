import 'dotenv/config';
import { API_CONSTANTS } from 'grammy';
import * as znv from 'znv';
import z from 'zod';

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
  BOT_SERVER_HOST: z.string().default('0.0.0.0'),

  BOT_SERVER_PORT: znv.port(),
  BOT_ADMINS: z.array(z.number()).default([]),
  BOT_ALLOWED_UPDATES: z
    .array(z.enum(API_CONSTANTS.ALL_UPDATE_TYPES))
    .default([]),
};

const environmentVariables = znv.parseEnv(process.env, configSchema);

export const config = {
  ...environmentVariables,
  isDev: environmentVariables.ENVIRONMENT === Environment.Development,
  isProd: environmentVariables.ENVIRONMENT === Environment.Production,
};

export type Config = typeof config;
