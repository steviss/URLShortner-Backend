import { Router } from 'express';
import { logout } from './logout';
import { me } from './me';

const router = Router();

router.route('/logout').get(logout);
router.route('/me').get(me);

export default router;
