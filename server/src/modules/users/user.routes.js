import express from 'express';
import {
    authGuard,
    requirePermission,
} from '../../middleware/authGuard.js';
import {
    createUserValidation,
    updateUserValidation,
} from './user.validation.js';
import controller from './user.controller.js';

const router = express.Router();

router.use(authGuard, requirePermission('manage_users'));

router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', createUserValidation, controller.create);
router.put('/:id', updateUserValidation, controller.update);
router.delete('/:id', controller.remove);

export default router;