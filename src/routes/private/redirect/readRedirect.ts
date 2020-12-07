import { NextFunction, Response, Request } from 'express';
import * as yup from 'yup';
import { Redirect } from '../../../entities';
import { ErrorDispatch } from '../../../utils/errorDispatch';

const schema = yup.object().shape({
    id: yup.string(),
});

export const readRedirect = async (req: Request, res: Response, next: NextFunction) => {
    let { id } = req.params;
    try {
        await schema.validate({
            id,
        });
        const existing = await Redirect.findOne({ id });
        if (!req.session.userId) {
            return res.status(400).json(ErrorDispatch('auth', 'You need to be authenticated.'));
        }
        if (existing?.ownerId !== req.session.userId) {
            return res.status(400).json(ErrorDispatch('auth', 'Invalid permissions.'));
        }
        if (!existing) {
            return res.status(400).json(ErrorDispatch('id', 'Invalid redirect ID.'));
        }
        return res.status(200).json({ status: 'success', message: 'Redirect succesfully updated.', data: existing });
    } catch (err) {
        return next(err);
    }
};
