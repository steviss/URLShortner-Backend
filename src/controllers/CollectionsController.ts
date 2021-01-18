import { nanoid } from 'nanoid';
import * as Yup from 'yup';
import { getRepository } from 'typeorm';
import { Request, Response } from 'express';
import { Collection } from '../entities';
import { ErrorDispatch } from '../utils/errorDispatch';
import { SuccessDispatch } from '../utils/successDispatch';
import { isAuth } from '../middleware/isAuth';
import { ResponseMessage } from '../api/ApiRouter';
import { post, controller, useMiddleware, put, del, get } from '../decorators';

@controller('/collections')
export class CollectionsController {
    @get('/')
    async readCollection(req: Request, res: Response): Promise<ResponseMessage> {
        let { id } = req.body;
        const schema = Yup.object().shape({
            id: Yup.string().required(),
        });
        try {
            await schema.validate({
                id,
            });
            const collection = await Collection.findOne({ id: id });
            if (!collection) {
                return res.status(200).json(ErrorDispatch('404', 'Collection not found.'));
            }
            if (collection.ownerId !== req.session.userId) {
                return res.status(200).json(ErrorDispatch('permissions', "You don't have permissions to read this collection."));
            }
            try {
                return res.status(200).json(SuccessDispatch('Collection found.', collection));
            } catch (err) {
                return res.status(200).json(ErrorDispatch('error', err.message));
            }
        } catch (err) {
            return res.status(200).json(ErrorDispatch('error', err.message));
        }
    }

    @post('/')
    async createCollection(req: Request, res: Response): Promise<ResponseMessage> {
        let { name } = req.body;
        const schema = Yup.object().shape({
            name: Yup.string()
                .trim()
                .matches(/^[\w\-]+$/i),
        });
        try {
            await schema.validate({
                name,
            });
            if (!name) {
                name = nanoid(5);
            }
            name = name.toLowerCase();
            try {
                let newCollection = { name: name } as Collection;
                if (req.session.userId) {
                    newCollection.ownerId = req.session.userId;
                }
                const created = (await getRepository(Collection).insert({ ...newCollection })).generatedMaps[0];
                let responseRedirect = Object.assign(newCollection, created);
                return res.status(200).json(SuccessDispatch('Collection created.', responseRedirect));
            } catch (err) {
                return res.status(200).json(ErrorDispatch('error', err.message));
            }
        } catch (err) {
            return res.status(200).json(ErrorDispatch('error', err.message));
        }
    }

    @put('/')
    @useMiddleware(isAuth)
    async updateCollection(req: Request, res: Response): Promise<ResponseMessage> {
        let { id, name } = req.body;
        const schema = Yup.object().shape({
            id: Yup.string().required(),
            name: Yup.string()
                .trim()
                .matches(/^[\w\-]+$/i),
        });
        try {
            await schema.validate({
                name,
                id,
            });
            const collection = await Collection.findOne({ id: id });
            if (!collection) {
                return res.status(200).json(ErrorDispatch('404', 'Collection not found.'));
            }
            if (collection.ownerId !== req.session.userId) {
                return res.status(200).json(ErrorDispatch('permissions', "You don't have permissions to modify this collection."));
            }
            try {
                await Collection.update(
                    {
                        id: id,
                        ownerId: req.session.userId,
                    },
                    { name: name },
                );
                const updatedCollection = (await Collection.findOne({ id: id })) as Collection;
                return res.status(200).json(SuccessDispatch('Collection succesfully updated.', updatedCollection));
            } catch (err) {
                return res.status(200).json(ErrorDispatch('error', err.message));
            }
        } catch (err) {
            return res.status(200).json(ErrorDispatch('error', err.message));
        }
    }

    @del('/')
    @useMiddleware(isAuth)
    async deleteCollection(req: Request, res: Response): Promise<ResponseMessage> {
        let { id } = req.body;
        const schema = Yup.object().shape({
            id: Yup.string().required(),
        });
        try {
            await schema.validate({
                id,
            });
            const collection = await Collection.findOne({ id: id });
            if (!collection) {
                return res.status(200).json(ErrorDispatch('404', 'Collection not found.'));
            }
            if (collection.ownerId !== req.session.userId) {
                return res.status(200).json(ErrorDispatch('permissions', "You don't have permissions to delete this collection."));
            }
            try {
                await Collection.delete({
                    id: id,
                });
                return res.status(200).json(SuccessDispatch('Collection succesfully deleted.', { id: id }));
            } catch (err) {
                return res.status(200).json(ErrorDispatch('error', err.message));
            }
        } catch (err) {
            return res.status(200).json(ErrorDispatch('error', err.message));
        }
    }
}
