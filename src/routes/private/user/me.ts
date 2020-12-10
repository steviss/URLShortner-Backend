import { NextFunction, Response, Request } from 'express';
import { SuccessDispatch } from '../../../utils/successDispatch';
import { User } from '../../../entities';
import { ErrorDispatch } from '../../../utils/errorDispatch';

interface meObject {
    id: string;
    email: string;
    password?: string;
}

export const createMeObject = (user: User) => {
    const me = Object.assign({}, user) as meObject;
    delete me.password;
    return me;
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
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
        return next(err);
    }
};
