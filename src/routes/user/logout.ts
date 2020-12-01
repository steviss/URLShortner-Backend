import * as yup from 'yup';
import { NextFunction, Response, Request } from 'express';
import { config } from '../../utils/_constants';

const schema = yup.object().shape({
    logout: yup.boolean(),
});

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    let { logout } = req.body;
    try {
        await schema.validate({
            logout,
        });
        return new Promise(() =>
            req.session.destroy((err: any) => {
                res.clearCookie(config.__SESSIONCOOKIENAME__);
                if (err) {
                    return res.status(400).json({ status: 'failed', message: err.message });
                }
                return res.status(200).json({ status: 'success', message: 'Succesfully logged out.' });
            }),
        );
    } catch (err) {
        return next(err);
    }
};
