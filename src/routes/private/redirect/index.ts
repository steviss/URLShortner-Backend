import { Router } from 'express';
import { claimRedirect } from './claimRedirect';
import { createRedirect } from './createRedirect';
import { readUserRedirects } from './readUserRedirects';
import { updateRedirect } from './updateRedirect';

const router = Router();

router.route('/create').post(createRedirect);
router.route('/update').put(updateRedirect);
router.route('/readUserRedirects').get(readUserRedirects);
router.route('/claim').put(claimRedirect);

export default router;
