import express from 'express';

import {
    authGuard,
    requirePermission,
} from '../../middleware/authGuard.js';

import { roleValidation } from './role.validation.js';

import {
    list,
    getOne,
    create,
    update,
    remove,
} from './role.controller.js';

const router = express.Router();

// Every role endpoint requires authentication
// and the manage_roles permission.
router.use(
    authGuard,
    requirePermission('manage_roles')
);

router.get('/', list);

router.get('/:id', getOne);

router.post(
    '/',
    roleValidation,
    create
);

router.put(
    '/:id',
    roleValidation,
    update
);

router.delete(
    '/:id',
    remove
);

export default router;