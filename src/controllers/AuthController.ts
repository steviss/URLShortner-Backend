import * as Yup from 'yup';
import argon2 from 'argon2';
import { v4 } from 'uuid';
import { Redis } from 'ioredis';
import { getRepository } from 'typeorm';
import { Request, Response } from 'express';
import { config } from '../utils/_constants';
import { User } from '../entities';
import { ErrorDispatch } from '../utils/errorDispatch';
import { SuccessDispatch } from '../utils/successDispatch';
import { sendEmail } from '../utils/sendEmail';
import { isAuth } from '../middleware/isAuth';
import { ApiRouter, ResponseMessage } from '../api/ApiRouter';
import { post, controller, put, useMiddleware, get } from '../decorators';

export interface meObject {
    id: string;
    email: string;
    password?: string;
}

export const createMeObject = (user: User) => {
    const me = Object.assign({}, user) as meObject;
    delete me.password;
    return me;
};

@controller('/auth')
export class AuthController {
    @post('/register')
    async postRegister(req: Request, res: Response): Promise<ResponseMessage> {
        let { email, password } = req.body;
        const schema = Yup.object().shape({
            password: Yup.string().required('No password provided.').min(8, 'Password is too short - should be 8 chars minimum.'),
            email: Yup.string().email('Invalid email').required('Required'),
        });
        if (req.session.userId) {
            return res.status(200).json(ErrorDispatch('auth', 'Already logged in.'));
        }
        try {
            await schema.validate({
                email,
                password,
            });
            const existing = await User.findOne({ email: email });
            if (existing) {
                return res.status(200).json(ErrorDispatch('email', 'E-mail already exists.'));
            }
            try {
                const hashedPassword = await argon2.hash(password);
                let newUser = { email: email, password: hashedPassword } as User;
                const created = (await getRepository(User).insert({ ...newUser })).generatedMaps[0] as User;
                req.session.userId = created.id;
                return res.status(200).json(SuccessDispatch('Registered successfully.', createMeObject(created)));
            } catch (err) {
                return res.status(200).json(ErrorDispatch('error', err.message));
            }
        } catch (err) {
            return res.status(200).json(ErrorDispatch('error', err.message));
        }
    }

    @post('/login')
    async postLogin(req: Request, res: Response): Promise<ResponseMessage> {
        const schema = Yup.object().shape({
            password: Yup.string().required('No password provided.').min(8, 'Password is too short - should be 8 chars minimum.'),
            email: Yup.string().email('Invalid email').required('Required'),
        });
        if (req.session.userId) {
            return res.status(200).json(ErrorDispatch('auth', 'Already logged in.'));
        }
        let { email, password } = req.body;
        try {
            await schema.validate({
                email,
                password,
            });
            const user = await User.findOne({ email: email });
            if (!user) {
                return res.status(200).json(ErrorDispatch('email', 'E-mail not found on record'));
            }
            const validatePassword = await argon2.verify(user.password, password);
            if (!validatePassword) {
                return res.status(200).json(ErrorDispatch('password', 'Wrong password.'));
            }
            req.session.userId = user.id;
            return res.status(200).json(SuccessDispatch('You have succesfully logged in!', createMeObject(user)));
        } catch (err) {
            return res.status(200).json(ErrorDispatch('error', err.message));
        }
    }

    @post('/logout')
    @useMiddleware(isAuth)
    async postLogout(req: Request, res: Response): Promise<ResponseMessage> {
        let { logout } = req.body;
        const schema = Yup.object().shape({
            logout: Yup.boolean(),
        });
        try {
            await schema.validate({
                logout,
            });
            return new Promise(() =>
                req.session.destroy((err: any) => {
                    res.clearCookie(config.__SESSIONCOOKIENAME__);
                    if (err) {
                        return res.status(200).json({ status: 'failed', message: err.message });
                    }
                    return res.status(200).json(SuccessDispatch('Succesfully logged out.', { loggedOut: true }));
                }),
            );
        } catch (err) {
            return res.status(200).json(ErrorDispatch('error', err.message));
        }
    }

    @put('/changePassword')
    async putChangePassword(req: Request, res: Response): Promise<ResponseMessage> {
        const redis: Redis = ApiRouter.getRedis();
        let { token, newPassword } = req.body;
        const schema = Yup.object().shape({
            token: Yup.string().required('No token provided').min(36),
            newPassword: Yup.string().required('No password provided.').min(8, 'Password is too short - should be 8 chars minimum.'),
        });
        try {
            await schema.validate({
                token,
                newPassword,
            });
            const tokenKey = `${config.__FORGOT_PASSWORD_PREFIX__}${token}`;
            const userId = await redis.get(tokenKey);
            if (!userId) {
                return res.status(200).json(ErrorDispatch('token', 'E-mail forgot password token expired.'));
            }
            const user = await User.findOne({ id: userId });
            if (!user) {
                return res.status(200).json(ErrorDispatch('email', 'User account has been removed.'));
            }
            try {
                //change password.
                await User.update({ id: userId }, { password: await argon2.hash(newPassword) });
                //Delete forgot password token
                await redis.del(tokenKey);
                //log the user in after changing password
                req.session.userId = user.id;
                return res.status(200).json(SuccessDispatch('Password succesfully changed, logging you in..', createMeObject(user)));
            } catch (err) {
                return res.status(200).json(ErrorDispatch('error', err.message));
            }
        } catch (err) {
            return res.status(200).json(ErrorDispatch('error', err.message));
        }
    }

    @put('/forgotPassword')
    async putForgotPassword(req: Request, res: Response): Promise<ResponseMessage> {
        const redis: Redis = ApiRouter.getRedis();
        let { email } = req.body;
        const schema = Yup.object().shape({
            email: Yup.string().email('Invalid email').required('Required'),
        });
        try {
            await schema.validate({
                email,
            });
            const user = await User.findOne({ email: email });
            if (!user) {
                return res.status(200).json(ErrorDispatch('email', 'E-mail not in database.'));
            }
            try {
                const token = v4();
                await redis.set(`${config.__FORGOT_PASSWORD_PREFIX__}${token}`, user.id, 'ex', config.__FORGOT_PASSWORD_EXPIRES__);
                const mailContents = `<a href="${config.__PROD__ ? config.__DOMAIN__ : config.__DEV_DOMAIN__}/forgot-password/${token}">Forgot Password Link</a>`;
                await sendEmail(email, mailContents);
                return res.status(200).json(SuccessDispatch('E-mail succesfully sent. Forgot password initialized.', { emailSent: true }));
            } catch (err) {
                return res.status(200).json(ErrorDispatch('error', err.message));
            }
        } catch (err) {
            return res.status(200).json(ErrorDispatch('error', err.message));
        }
    }

    @get('/me')
    @useMiddleware(isAuth)
    async getMe(req: Request, res: Response): Promise<ResponseMessage> {
        try {
            if (!req.session.userId) {
                return res.status(200).json(ErrorDispatch('auth', 'Not authenticated, please login.'));
            }
            const user = await User.findOne({ id: req.session.userId });
            if (!user) {
                return res.status(200).json(ErrorDispatch('user', "User doesn't extist."));
            }
            return res.status(200).json(SuccessDispatch('User authenticated.', createMeObject(user)));
        } catch (err) {
            return res.status(200).json(ErrorDispatch('error', err.message));
        }
    }
}
