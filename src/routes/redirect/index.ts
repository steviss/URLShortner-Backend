import { Router } from 'express';
import { createRedirect } from './createRedirect';
import { updateRedirect } from './updateRedirect';

const router = Router();

router.route('/create').post(createRedirect);
router.route('/update').put(updateRedirect);

export default router;
