import * as yup from 'yup';
import { NextFunction, Response, Request } from 'express';
import argon2 from 'argon2';
import { User } from '../../entities';
import { ErrorDispatch } from '../../utils/errorDispatch';

const schema = yup.object().shape({
    password: yup.string().required('No password provided.').min(8, 'Password is too short - should be 8 chars minimum.'),
    email: yup.string().email('Invalid email').required('Required'),
});

export const login = async (req: Request, res: Response, next: NextFunction) => {
    if (req.session.userId) {
        return res.status(400).json(ErrorDispatch('auth', 'Already logged in.'));
    }
    let { email, password } = req.body;
    try {
        await schema.validate({
            email,
            password,
        });
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json(ErrorDispatch('email', 'E-mail not found on record'));
        }
        const validatePassword = await argon2.verify(user.password, password);
        if (!validatePassword) {
            return res.status(400).json(ErrorDispatch('password', 'Wrong password.'));
        }
        req.session.userId = user.id;
        return res.status(200).json({ status: 'success', message: 'You have succesfully logged in!' });
    } catch (err) {
        return next(err);
    }
};
