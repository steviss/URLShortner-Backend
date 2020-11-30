import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import * as yup from 'yup';
import { Redis } from 'ioredis';
import { v4 } from 'uuid';
import { ErrorDispatch } from '../../utils/errorDispatch';
import { slowDownConfig } from '../../slowDown.config';
import { rateLimitConfig } from '../../rateLimit.config';
import { config } from '../../utils/_constants';
import { sendEmail } from '../../utils/sendEmail';
import { User } from '../../entities/User';

const schema = yup.object().shape({
    email: yup.string().email('Invalid email').required('Required'),
});

export const forgotPassword = (redis: Redis) => {
    const router = Router();
    return router.post('/forgot-password', slowDown(slowDownConfig), rateLimit(rateLimitConfig), async (req, res, next) => {
        let { email } = req.body;
        try {
            await schema.validate({
                email,
            });
            const user = await User.findOne({ email: email });
            if (!user) {
                return res.status(400).json(ErrorDispatch('email', 'E-mail not in database.'));
            }
            try {
                const token = v4();
                await redis.set(`${config.__FORGOT_PASSWORD_PREFIX__}${token}`, user.id, 'ex', config.__FORGOT_PASSWORD_EXPIRES__);
                const mailContents = `<a href="${config.__PROD__ ? config.__DOMAIN__ : config.__DEV_DOMAIN__}/forgot-password/${token}">Forgot Password Link</a>`;
                await sendEmail(email, mailContents);
                return res.status(200).json({ status: 'success', message: 'E-mail succesfully sent. Forgot password initialized.' });
            } catch (err) {
                return next(err);
            }
        } catch (err) {
            return next(err);
        }
    });
};
