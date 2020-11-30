import { Router } from 'express';
import { Redirect } from '@entities';
import { ErrorDispatch } from '@utils/errorDispatch';

export const slugRedirect = () => {
    const router = Router();
    return router.get('/:slug', async (req, res) => {
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
    });
};
