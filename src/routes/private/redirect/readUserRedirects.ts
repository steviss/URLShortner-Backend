import { NextFunction, Response, Request } from 'express';
import { getConnection } from 'typeorm';
import { SuccessDispatch } from '../../../utils/successDispatch';
import * as yup from 'yup';
import { ErrorDispatch } from '../../../utils/errorDispatch';
import { Redirect } from '../../../entities';

const schema = yup.object().shape({
    cursor: yup.string(),
    limit: yup.number(),
});

export const readUserRedirects = async (req: Request, res: Response, next: NextFunction) => {
    let { cursor, limit } = req.query;
    try {
        await schema.validate({
            cursor,
            limit,
        });
        const realLimit = Math.min(50, parseInt((limit as string) || '50', 10));
        const reaLimitPlusOne = realLimit + 1;
        const realCursor = parseInt((cursor as string) || '0', 10);
        if (!req.session.userId) {
            return res.status(400).json(ErrorDispatch('auth', 'You need to be authenticated.'));
        }
        const redirects = await getConnection()
            .getRepository(Redirect)
            .createQueryBuilder('redirect')
            .distinctOn(['redirect.createdAt'])
            .where('redirect.ownerId = :id', { id: req.session.userId })
            .skip(realCursor)
            .take(reaLimitPlusOne)
            .leftJoinAndSelect('redirect.clicks', 'click')
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
        return next(err);
    }
};
