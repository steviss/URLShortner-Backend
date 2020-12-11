import { NextFunction, Response, Request } from 'express';
import { SuccessDispatch } from 'utils/successDispatch';
import * as yup from 'yup';
import { Redirect } from '../../../entities';
import { ErrorDispatch } from '../../../utils/errorDispatch';

const schema = yup.object().shape({
    id: yup.string(),
});

export const readRedirect = async (req: Request, res: Response, next: NextFunction) => {
    let { id } = req.query;
    try {
        await schema.validate({
            id,
        });
        const existing = await Redirect.findOne({ id: id as string });
        if (!req.session.userId) {
            return res.status(200).json(ErrorDispatch('auth', 'You need to be authenticated.'));
        }
        if (existing?.ownerId !== req.session.userId) {
            return res.status(200).json(ErrorDispatch('auth', 'Invalid permissions.'));
        }
        if (!existing) {
            return res.status(200).json(ErrorDispatch('id', 'Invalid redirect ID.'));
        }
        return res.status(200).json(SuccessDispatch('Redirect succesfully updated.', existing));
    } catch (err) {
        return next(err);
    }
};
