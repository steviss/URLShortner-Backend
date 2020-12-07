import { NextFunction, Response, Request } from 'express';
import { nanoid } from 'nanoid';
import * as yup from 'yup';
import { getRepository } from 'typeorm';
import { Redirect } from '../../../entities';
import { config } from '../../../utils/_constants';
import { ErrorDispatch } from '../../../utils/errorDispatch';

const schema = yup.object().shape({
    slug: yup
        .string()
        .trim()
        .matches(/^[\w\-]+$/i),
    url: yup.string().trim().url().required(),
});

export const createRedirect = async (req: Request, res: Response, next: NextFunction) => {
    let { url, slug } = req.body;
    try {
        if (url.includes(config.__DOMAIN__ as string)) {
            return res.status(400).json(ErrorDispatch('url', "Please, don't use our domain. No loopies."));
        }
        await schema.validate({
            slug,
            url,
        });
        if (!slug) {
            slug = nanoid(5);
        }
        const existing = await Redirect.findOne({ slug: slug });
        if (existing) {
            return res.status(400).json(ErrorDispatch('slug', 'Slug in use, try another.'));
        }
        slug = slug.toLowerCase();
        try {
            let newRedirect = { url: url, slug: slug } as Redirect;
            if (req.session.userId) {
                newRedirect.ownerId = req.session.userId;
            }
            const created = (await getRepository(Redirect).insert({ ...newRedirect })).generatedMaps[0];
            res.json(created);
        } catch (err) {
            return next(err);
        }
    } catch (err) {
        return next(err);
    }
};
