FROM node:20.10.0-bullseye-slim AS build

WORKDIR /app
COPY . .

RUN yarn install
RUN yarn build

FROM node:20.10.0-bullseye-slim AS runtime

WORKDIR /app

ENV NODE_ENV production

USER node

COPY --chown=node:node ./locales ./locales
COPY --chown=node:node ./package.json ./package.json
COPY --chown=node:node ./.adminjs ./.adminjs
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist .

CMD ["node", "./bin/dbp-quiz-bot.js"]