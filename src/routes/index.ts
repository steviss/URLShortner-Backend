import { Router } from 'express';
import { Redis } from 'ioredis';
import redirectRoutes from './redirect';
import userRoutes from './user';
import { changePassword } from './public/changePassword';
import { forgotPassword } from './public/forgotPassword';
import { register } from './public/register';
import { redirect } from './public/redirect';
import { login } from './public/login';

export const routeMiddleware = (redis: Redis) => {
    const router = Router();
    router.route('/r/:slug').get(redirect);
    router.use('/redirect', redirectRoutes);
    router.use('/user', userRoutes);
    router.route('/login').post(login);
    router.route('/register').post(register);
    router.route('/changePassword').put((req, res, next) => changePassword(req, res, next, redis));
    router.route('/forgotPassword').put((req, res, next) => forgotPassword(req, res, next, redis));
    return router;
};
