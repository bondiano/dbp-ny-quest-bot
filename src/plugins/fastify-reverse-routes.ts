import { FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin';
import { PathFunction, compile } from 'path-to-regexp';

declare module 'fastify' {
  interface FastifyInstance {
    reverse<Arguments>(name: string, arguments_?: Arguments): string;
  }

  interface RouteShorthandOptions {
    name: string;
  }
}

export const fastifyReverseRoutes: FastifyPluginCallback = (
  instance,
  _,
  done,
) => {
  const routes = new Map<string, PathFunction<any>>();

  const reverse = <Arguments>(name: string, arguments_?: Arguments) => {
    const route = routes.get(name);

    if (!route) {
      throw new Error(`Route with name ${name} not found`);
    }

    return route(arguments_);
  };

  instance.decorate('reverse', reverse);
  instance.addHook('onRoute', (routeOptions) => {
    if (routeOptions.name) {
      if (routes.has(routeOptions.name)) {
        throw new Error(
          `Route with name ${routeOptions.name} already registered`,
        );
      }

      routes.set(routeOptions.name, compile(routeOptions.url));
    }
  });

  done();
};

export const reversePlugin = fp(fastifyReverseRoutes, {
  name: 'fastify-reverse-routes',
});
