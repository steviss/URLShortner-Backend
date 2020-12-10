import { Router } from 'express';
import { Redis } from 'ioredis';
import redirectRoutes from './private/redirect';
import userRoutes from './private/user';
import { changePassword } from './public/changePassword';
import { forgotPassword } from './public/forgotPassword';
import { register } from './public/register';
import { redirect } from './public/redirect';
import { login } from './public/login';

export const routeMiddleware = (redis: Redis) => {
    const router = Router();
    router.route('/r/:slug').get(redirect);
    router.use('/api/redirect', redirectRoutes);
    router.use('/api/user', userRoutes);
    router.route('/api/public/login').post(login);
    router.route('/api/public/register').post(register);
    router.route('/api/public/changePassword').put((req, res, next) => changePassword(req, res, next, redis));
    router.route('/api/public/forgotPassword').put((req, res, next) => forgotPassword(req, res, next, redis));
    return router;
};
