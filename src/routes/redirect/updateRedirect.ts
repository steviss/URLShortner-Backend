import { Router } from 'express';
import { Redirect } from '../../entities';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import * as yup from 'yup';
import { getConnection } from 'typeorm';
import { config } from '../../utils/_constants';
import { rateLimitConfig } from '../../rateLimit.config';
import { slowDownConfig } from '../../slowDown.config';
import { ErrorDispatch } from '../../utils/errorDispatch';

const schema = yup.object().shape({
    url: yup.string().trim().url().required(),
});

export const updateRedirect = () => {
    const router = Router();
    return router.patch('/url/update', slowDown(slowDownConfig), rateLimit(rateLimitConfig), async (req, res, next) => {
        let { id, url } = req.body;
        try {
            await schema.validate({
                url,
            });
            if (url.includes(config.__DOMAIN__ as string)) {
                throw new Error('No loopies');
            }
            if (!req.session.userId) {
                return res.status(302).json(ErrorDispatch('auth', 'Not authenticated, please login.')).redirect('/login');
            }
            const redirect = await Redirect.findOne({ id: id });
            if (!redirect) {
                return res.status(400).json(ErrorDispatch('404', 'Redirect not found.'));
            }
            if (redirect?.ownerId !== req.session.userId) {
                return res.status(400).json(ErrorDispatch('permissions', "You don't have permissions to modify this redirect."));
            }
            try {
                const updated = await getConnection()
                    .createQueryBuilder()
                    .update(Redirect)
                    .set({ url: url })
                    .where('id = :id and "ownerId" = :ownerId', {
                        id,
                        ownerId: req.session.userId,
                    })
                    .returning('*')
                    .execute();
                return res.status(200).json({ status: 'success', message: 'E-mail succesfully sent. Forgot password initialized.', data: updated.generatedMaps[0] });
            } catch (err) {
                return next(err);
            }
        } catch (err) {
            return next(err);
        }
    });
};
