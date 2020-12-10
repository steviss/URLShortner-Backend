import { Request, Response, NextFunction } from 'express';
import { Redirect } from '../../../entities';
import * as yup from 'yup';
import { config } from '../../../utils/_constants';
import { ErrorDispatch } from '../../../utils/errorDispatch';
import { SuccessDispatch } from '../../../utils/successDispatch';

const schema = yup.object().shape({
    id: yup.string().required(),
    url: yup.string().trim().url().required(),
});

export const updateRedirect = async (req: Request, res: Response, next: NextFunction) => {
    let { id, url } = req.body;
    try {
        await schema.validate({
            id,
            url,
        });
        if (url.includes(config.__DOMAIN__ as string)) {
            return res.status(200).json(ErrorDispatch('url', "Please, don't use our domain. No loopies."));
        }
        if (!req.session.userId) {
            return res.status(200).json(ErrorDispatch('auth', 'Not authenticated, please login.'));
        }
        const redirect = await Redirect.findOne({ id: id });
        if (!redirect) {
            return res.status(200).json(ErrorDispatch('404', 'Redirect not found.'));
        }
        if (redirect.ownerId !== req.session.userId) {
            return res.status(200).json(ErrorDispatch('permissions', "You don't have permissions to modify this redirect."));
        }
        try {
            await Redirect.update(
                {
                    id: id,
                    ownerId: req.session.userId,
                },
                { url: url },
            );
            const updatedRedirect = (await Redirect.findOne({ id: id })) as Redirect;
            return res.status(200).json(SuccessDispatch('Redirect succesfully updated.', updatedRedirect));
        } catch (err) {
            return next(err);
        }
    } catch (err) {
        return next(err);
    }
};
