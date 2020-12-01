import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { rateLimitConfig } from 'rateLimit.config';
import { slowDownConfig } from 'slowDown.config';
import * as yup from 'yup';
import { Redis } from 'ioredis';
import argon2 from 'argon2';
import { User } from '../../entities';
import { ErrorDispatch } from '../../utils/errorDispatch';
import { config } from '../../utils/_constants';

const schema = yup.object().shape({
    token: yup.string().email('Invalid email').required('Required'),
    newPassword: yup.string().required('No password provided.').min(8, 'Password is too short - should be 8 chars minimum.'),
});

export const changePassword = (redis: Redis) => {
    const router = Router();
    return router.patch('/change-password', slowDown(slowDownConfig), rateLimit(rateLimitConfig), async (req, res, next) => {
        let { token, newPassword } = req.body;
        try {
            await schema.validate({
                token,
                newPassword,
            });
            const tokenKey = `${config.__FORGOT_PASSWORD_PREFIX__}${token}`;
            const userId = await redis.get(tokenKey);
            if (!userId) {
                return res.status(400).json(ErrorDispatch('token', 'E-mail forgot password token expired.'));
            }
            const user = await User.findOne({ id: userId });
            if (!user) {
                return res.status(400).json(ErrorDispatch('email', 'User account has been removed.'));
            }
            try {
                //change password.
                await User.update({ id: userId }, { password: await argon2.hash(newPassword) });
                //Delete forgot password token
                await redis.del(tokenKey);
                //log the user in after changing password
                req.session.userId = user.id;
                return res.status(200).json({ status: 'success', message: 'Password succesfully changed, logging you in..' });
            } catch (err) {
                return next(err);
            }
        } catch (err) {
            return next(err);
        }
    });
};
