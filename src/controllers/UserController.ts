import * as Yup from 'yup';
import { getConnection } from 'typeorm';
import { Request, Response } from 'express';
import { Collection, Redirect } from '../entities';
import { ErrorDispatch } from '../utils/errorDispatch';
import { SuccessDispatch } from '../utils/successDispatch';
import { isAuth } from '../middleware/isAuth';
import { ResponseMessage } from '../api/ApiRouter';
import { controller, useMiddleware, get } from '../decorators';

@controller('/user')
export class UserController {
    @get('/redirects')
    @useMiddleware(isAuth)
    async readUserRedirects(req: Request, res: Response): Promise<ResponseMessage> {
        let { cursor, limit } = req.query;
        const schema = Yup.object().shape({
            cursor: Yup.string(),
            limit: Yup.number(),
        });
        try {
            await schema.validate({
                cursor,
                limit,
            });
            const realLimit = Math.min(50, parseInt((limit as string) || '50', 10));
            const reaLimitPlusOne = realLimit + 1;
            const realCursor = parseInt((cursor as string) || '0', 10);
            const redirects = await getConnection()
                .getRepository(Redirect)
                .createQueryBuilder('redirect')
                .distinctOn(['redirect.createdAt'])
                .where('redirect.ownerId = :id', { id: req.session.userId })
                .skip(realCursor)
                .take(reaLimitPlusOne)
                .leftJoinAndSelect('redirect.clicks', 'click')
                .leftJoinAndSelect('redirect.collections', 'collection')
                .orderBy('redirect.createdAt', 'DESC')
                .getManyAndCount();
            return res.status(200).json(
                SuccessDispatch('User redirects retrived.', {
                    items: redirects[0],
                    total: redirects[1],
                    hasMore: redirects[1] > realCursor + reaLimitPlusOne,
                }),
            );
        } catch (err) {
            return res.status(200).json(ErrorDispatch('error', err.message));
        }
    }
    @get('/collections')
    @useMiddleware(isAuth)
    async readUserCollections(req: Request, res: Response): Promise<ResponseMessage> {
        let { cursor, limit } = req.query;
        const schema = Yup.object().shape({
            cursor: Yup.string(),
            limit: Yup.number(),
        });
        try {
            await schema.validate({
                cursor,
                limit,
            });
            const realLimit = Math.min(50, parseInt((limit as string) || '50', 10));
            const reaLimitPlusOne = realLimit + 1;
            const realCursor = parseInt((cursor as string) || '0', 10);
            const collection = await getConnection()
                .getRepository(Collection)
                .createQueryBuilder('collection')
                .leftJoinAndSelect('collection.redirects', 'redirect')
                .distinctOn(['collection.createdAt'])
                .where('collection.ownerId = :id', { id: req.session.userId })
                .skip(realCursor)
                .take(reaLimitPlusOne)
                .orderBy('collection.createdAt', 'DESC')
                .getManyAndCount();
            return res.status(200).json(
                SuccessDispatch('User collections retrived.', {
                    items: collection[0],
                    total: collection[1],
                    hasMore: collection[1] > realCursor + reaLimitPlusOne,
                }),
            );
        } catch (err) {
            return res.status(200).json(ErrorDispatch('error', err.message));
        }
    }
}
