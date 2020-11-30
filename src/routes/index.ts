import { Router } from 'express';
import { Redis } from 'ioredis';
import { createRedirect, slugRedirect } from './redirect';
import { changePassword, forgotPassword, register } from './user';

export const routeMiddleware = (redis: Redis) => {
    const routes = Router();
    routes.use('/', slugRedirect);
    routes.use('/', createRedirect);
    routes.use('/', register);
    routes.use('/', forgotPassword(redis));
    routes.use('/', changePassword(redis));
    return routes;
};
