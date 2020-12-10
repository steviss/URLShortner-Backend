import { NextFunction, Response, Request } from 'express';
import * as yup from 'yup';
import { Redirect } from '../../../entities';
import { ErrorDispatch } from '../../../utils/errorDispatch';
import { SuccessDispatch } from '../../../utils/successDispatch';

const schema = yup.object().shape({
    id: yup.string().required(),
    claimKey: yup.string().min(12).max(12),
});

export const claimRedirect = async (req: Request, res: Response, next: NextFunction) => {
    let { id, claimKey } = req.body;
    try {
        await schema.validate({
            id,
            claimKey,
        });
        const existing = await Redirect.findOne({ id: id });
        if (existing) {
            if (existing.ownerId) return res.status(200).json(ErrorDispatch('slug', "Slug has an owner, it can't be claimed."));
        } else {
            return res.status(200).json(ErrorDispatch('slug', "Slug doesn't exist."));
        }
        if (!req.session.userId) {
            return res.status(200).json(ErrorDispatch('auth', 'Not authenticated, please login.'));
        }
        try {
            await Redirect.update(
                {
                    id: id,
                },
                {
                    ownerId: req.session.userId,
                    claimKey: null,
                },
            );
            const updatedRedirect = (await Redirect.findOne({ id: id })) as Redirect;
            return res.status(200).json(SuccessDispatch('Redirect succesfully claimed.', updatedRedirect));
        } catch (err) {
            return next(err);
        }
    } catch (err) {
        return next(err);
    }
};
