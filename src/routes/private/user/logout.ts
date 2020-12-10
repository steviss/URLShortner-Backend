import * as yup from 'yup';
import { NextFunction, Response, Request } from 'express';
import { config } from '../../../utils/_constants';
import { SuccessDispatch } from '../../../utils/successDispatch';

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
                    return res.status(200).json({ status: 'failed', message: err.message });
                }
                return res.status(200).json(SuccessDispatch('Succesfully logged out.', { loggedOut: true }));
            }),
        );
    } catch (err) {
        return next(err);
    }
};
