import { Router } from 'express';
import { Redis } from 'ioredis';
import { createRedirect } from './redirect/createRedirect';
import { slugRedirect } from './redirect/slugRedirect';
import { changePassword } from './user/changePassword';
import { forgotPassword } from './user/forgotPassword';
import { register } from './user/register';

export const routeMiddleware = (redis: Redis) => {
    const routes = Router();
    routes.use('/', slugRedirect);
    routes.use('/', createRedirect);
    routes.use('/', register);
    routes.use('/', forgotPassword(redis));
    routes.use('/', changePassword(redis));
    return routes;
};
