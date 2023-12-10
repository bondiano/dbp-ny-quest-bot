#!/usr/bin/env tsx
/* eslint-disable node/shebang */

import _ from 'lodash';
import repl from 'node:repl';

import { prisma } from '@quiz-bot/prisma.js';
import { createServicesContainer } from '@quiz-bot/services/index.js';

const r = repl.start({
  useColors: true,
  prompt: 'quiz-bot> ',
});
r.setupHistory('.node_repl_history', (error) => {
  if (error) {
    console.error(error);
  }
});

r.context.prisma = prisma;
r.context.services = createServicesContainer();
r.context.l = _;
