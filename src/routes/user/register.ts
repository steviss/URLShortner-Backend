import { Router } from 'express';
import * as yup from 'yup';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { getRepository } from 'typeorm';
import argon2 from 'argon2';
import { User } from '../../entities';
import { ErrorDispatch } from '../../utils/errorDispatch';
import { slowDownConfig } from '../../slowDown.config';
import { rateLimitConfig } from '../../rateLimit.config';

const schema = yup.object().shape({
    password: yup.string().required('No password provided.').min(8, 'Password is too short - should be 8 chars minimum.'),
    email: yup.string().email('Invalid email').required('Required'),
});

export const register = () => {
    const router = Router();
    return router.post('/register', slowDown(slowDownConfig), rateLimit(rateLimitConfig), async (req, res, next) => {
        let { email, password } = req.body;
        try {
            await schema.validate({
                email,
                password,
            });
            const existing = await User.findOne({ email: email });
            if (existing) {
                return res.status(400).json(ErrorDispatch('email', 'E-mail already exists.'));
            }
            try {
                const hashedPassword = await argon2.hash(password);
                let newUser = { email: email, password: hashedPassword } as User;
                const created = (await getRepository(User).insert({ ...newUser })).generatedMaps[0];
                req.session.userId = created.id;
                return res.status(302).redirect('/dashboard');
            } catch (err) {
                return next(err);
            }
        } catch (err) {
            return next(err);
        }
    });
};
