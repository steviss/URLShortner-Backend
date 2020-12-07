import { NextFunction, Response, Request } from 'express';
import { getConnection } from 'typeorm';
import * as yup from 'yup';
import { ErrorDispatch } from '../../../utils/errorDispatch';

const schema = yup.object().shape({
    cursor: yup.string(),
    limit: yup.number(),
});

export const readUserRedirects = async (req: Request, res: Response, next: NextFunction) => {
    let { cursor, limit } = req.params;
    try {
        await schema.validate({
            cursor,
            limit,
        });
        const realLimit = Math.min(50, parseInt(limit, 10));
        const reaLimitPlusOne = realLimit + 1;
        const replacements: any[] = [reaLimitPlusOne];
        if (!req.session.userId) {
            return res.status(400).json(ErrorDispatch('auth', 'You need to be authenticated.'));
        }
        const redirects = await getConnection().query(
            `
                select r.*
                from redirect r
                ${cursor ? `where r.id < $2` : ''} and r."ownerID" = ${req.session.userId}
                order by r."id" DESC
                limit $1
            `,
            replacements,
        );
        return res.status(200).json({
            status: 'success',
            message: 'User redirects retrived.',
            data: {
                redirects: redirects.slice(0, realLimit),
                hasMore: redirects.length === reaLimitPlusOne,
            },
        });
    } catch (err) {
        return next(err);
    }
};
