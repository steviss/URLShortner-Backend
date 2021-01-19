import { NextFunction, Response, Request } from 'express';
import { ErrorDispatch } from '../utils/';

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
        return res.status(200).json(ErrorDispatch('auth', 'Not authenticated, please login.'));
    } else {
        next();
        return;
    }
};
