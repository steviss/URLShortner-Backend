import { nanoid } from 'nanoid';
import * as Yup from 'yup';
import { getRepository } from 'typeorm';
import { Request, Response } from 'express';
import { Redirect } from '../entities';
import { ErrorDispatch } from '../utils/errorDispatch';
import { SuccessDispatch } from '../utils/successDispatch';
import { isAuth } from '../middleware/isAuth';
import { config } from '../utils/_constants';
import { ResponseMessage } from '../api/ApiRouter';
import { post, controller, useMiddleware, put, del, get, patch } from '../decorators';

@controller('/redirects')
export class RedirectController {
    @patch('/claim')
    @useMiddleware(isAuth)
    async claimRedirect(req: Request, res: Response): Promise<ResponseMessage> {
        let { id, claimKey } = req.body;
        const schema = Yup.object().shape({
            id: Yup.string().required(),
            claimKey: Yup.string().min(12).max(12),
        });
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
                return res.status(200).json(ErrorDispatch('error', err.message));
            }
        } catch (err) {
            return res.status(200).json(ErrorDispatch('error', err.message));
        }
    }

    @get('/')
    async readRedirect(req: Request, res: Response): Promise<ResponseMessage> {
        let { id } = req.body;
        const schema = Yup.object().shape({
            id: Yup.string().required(),
        });
        try {
            await schema.validate({
                id,
            });
            const redirect = await Redirect.findOne({ id: id });
            if (!redirect) {
                return res.status(200).json(ErrorDispatch('404', 'Redirect not found.'));
            }
            if (redirect.ownerId !== req.session.userId) {
                return res.status(200).json(ErrorDispatch('permissions', "You don't have permissions to read this redirect."));
            }
            try {
                return res.status(200).json(SuccessDispatch('Redirect found.', redirect));
            } catch (err) {
                return res.status(200).json(ErrorDispatch('error', err.message));
            }
        } catch (err) {
            return res.status(200).json(ErrorDispatch('error', err.message));
        }
    }

    @post('/')
    async createRedirect(req: Request, res: Response): Promise<ResponseMessage> {
        let { url, slug } = req.body;
        const schema = Yup.object().shape({
            slug: Yup.string()
                .trim()
                .matches(/^[\w\-]+$/i),
            url: Yup.string().trim().url().required(),
        });
        try {
            await schema.validate({
                slug,
                url,
            });
            if (url.includes(config.__DOMAIN__ as string)) {
                return res.status(200).json(ErrorDispatch('url', "Please, don't use our domain. No loopies."));
            }
            if (!slug) {
                slug = nanoid(5);
            }
            const existing = await Redirect.findOne({ slug: slug });
            if (existing) {
                return res.status(200).json(ErrorDispatch('slug', 'Slug in use, try another.'));
            }
            slug = slug.toLowerCase();
            try {
                let newRedirect = { url: url, slug: slug } as Redirect;
                if (req.session.userId) {
                    newRedirect.ownerId = req.session.userId;
                } else {
                    newRedirect.claimKey = nanoid(12);
                }
                const created = (await getRepository(Redirect).insert({ ...newRedirect })).generatedMaps[0];
                let responseRedirect = Object.assign(newRedirect, created);
                return res.status(200).json(SuccessDispatch('Redirect created.', responseRedirect));
            } catch (err) {
                return res.status(200).json(ErrorDispatch('error', err.message));
            }
        } catch (err) {
            return res.status(200).json(ErrorDispatch('error', err.message));
        }
    }

    @put('/')
    @useMiddleware(isAuth)
    async updateRedirect(req: Request, res: Response): Promise<ResponseMessage> {
        let { id, url } = req.body;
        const schema = Yup.object().shape({
            id: Yup.string().required(),
            url: Yup.string().trim().url().required(),
        });
        try {
            await schema.validate({
                id,
                url,
            });
            if (url.includes(config.__DOMAIN__ as string)) {
                return res.status(200).json(ErrorDispatch('url', "Please, don't use our domain. No loopies."));
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
                return res.status(200).json(ErrorDispatch('error', err.message));
            }
        } catch (err) {
            return res.status(200).json(ErrorDispatch('error', err.message));
        }
    }

    @del('/')
    @useMiddleware(isAuth)
    async deleteRedirect(req: Request, res: Response): Promise<ResponseMessage> {
        let { id } = req.body;
        const schema = Yup.object().shape({
            id: Yup.string().required(),
        });
        try {
            await schema.validate({
                id,
            });
            const redirect = await Redirect.findOne({ id: id });
            if (!redirect) {
                return res.status(200).json(ErrorDispatch('404', 'Redirect not found.'));
            }
            if (redirect.ownerId !== req.session.userId) {
                return res.status(200).json(ErrorDispatch('permissions', "You don't have permissions to delete this redirect."));
            }
            try {
                await Redirect.delete({
                    id: id,
                });
                return res.status(200).json(SuccessDispatch('Redirect succesfully deleted.', { id: id }));
            } catch (err) {
                return res.status(200).json(ErrorDispatch('error', err.message));
            }
        } catch (err) {
            return res.status(200).json(ErrorDispatch('error', err.message));
        }
    }
}
