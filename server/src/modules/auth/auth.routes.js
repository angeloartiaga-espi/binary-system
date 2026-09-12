import express from 'express';
import upload from '../../middleware/upload.js';
import { authGuard } from '../../middleware/authGuard.js';
import {
    registerValidation,
    loginValidation,
} from './auth.validation.js';
import controller from './auth.controller.js';

const router = express.Router();

router.post(
    '/register',
    upload.single('idImage'),
    registerValidation,
    controller.register
);

router.post(
    '/login',
    loginValidation,
    controller.login
);

router.get(
    '/me',
    authGuard,
    controller.me
);

router.get('/verify-email/:token', controller.verifyEmail);

export default router;