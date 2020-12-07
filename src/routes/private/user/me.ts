import { NextFunction, Response, Request } from 'express';
import { User } from '../../../entities';
import { ErrorDispatch } from '../../../utils/errorDispatch';

interface meObject {
    id: string;
    email: string;
    password?: string;
}

export const me = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.session.userId) {
            return res.status(302).json(ErrorDispatch('auth', 'Not authenticated, please login.')).redirect('/login');
        }
        const user = await User.findOne({ id: req.session.userId });
        if (!user) {
            return res.status(400).json(ErrorDispatch('user', "User doesn't extist."));
        }
        const me = Object.assign({}, user) as meObject;
        delete me.password;
        return res.status(200).json({ me });
    } catch (err) {
        return next(err);
    }
};
