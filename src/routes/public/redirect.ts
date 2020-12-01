import { NextFunction, Response, Request } from 'express';
import { Redirect } from '../../entities';
import { ErrorDispatch } from '../../utils/errorDispatch';

export const redirect = async (req: Request, res: Response, _next: NextFunction) => {
    const { slug } = req.params;
    try {
        const redirect = await Redirect.findOne({ slug: slug });
        if (redirect) {
            return res.status(302).redirect(redirect.url);
        }
        return res.status(400).json(ErrorDispatch('slug', 'Slug not found.'));
    } catch (err) {
        return res.status(400).json(ErrorDispatch('slug', 'Slug not found.'));
    }
};