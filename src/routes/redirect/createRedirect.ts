import { Router } from 'express';
import { Redirect } from '@entities';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { nanoid } from 'nanoid';
import * as yup from 'yup';
import { getRepository } from 'typeorm';
import { config } from '@utils/_constants';
import { rateLimitConfig } from 'rateLimit.config';
import { slowDownConfig } from 'slowDown.config';

const schema = yup.object().shape({
    slug: yup
        .string()
        .trim()
        .matches(/^[\w\-]+$/i),
    url: yup.string().trim().url().required(),
});

export const createRedirect = () => {
    const router = Router();
    return router.post('/url', slowDown(slowDownConfig), rateLimit(rateLimitConfig), async (req, res, next) => {
        let { url, slug } = req.body;
        try {
            await schema.validate({
                slug,
                url,
            });
            if (!slug) {
                slug = nanoid(5);
            }
            const existing = await Redirect.findOne(slug);
            if (existing) {
                throw new Error('Slug in use.');
            }
            slug = slug.toLowerCase();
            try {
                let newRedirect = { url: url, slug: slug } as Redirect;
                if (req.session.userId) {
                    newRedirect.ownerId = req.session.userId;
                }
                const created = (await getRepository(Redirect).insert({ ...newRedirect })).generatedMaps[0];
                res.json(created);
                if (url.includes(config.__DOMAIN__ as string)) {
                    throw new Error('No loopies');
                }
            } catch (err) {
                next(err);
            }
        } catch (err) {
            next(err);
        }
    });
};
