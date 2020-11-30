import { Router } from 'express';
import { Redis } from 'ioredis';
import { slugRedirect } from './redirect';

export const routeMiddleware = (_redis: Redis) => {
    const routes = Router();
    routes.use('/:slug', slugRedirect);
    return routes;
};
