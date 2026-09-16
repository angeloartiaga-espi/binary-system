import express from 'express';
import {
    authGuard,
    requirePermission,
} from '../../middleware/authGuard.js';
import { list } from './permission.controller.js';

const router = express.Router();

router.use(
    authGuard,
    requirePermission('manage_roles')
);

router.get('/', list);

export default router;