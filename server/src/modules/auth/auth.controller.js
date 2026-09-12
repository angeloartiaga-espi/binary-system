import { validationResult } from 'express-validator';
import { registerUser, loginUser, verifyEmail as verifyEmailService } from './auth.service.js';

async function register(req, res, next) {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }

        // req.file is set by the `upload.single('idImage')` middleware
        const idImageUrl = req.file ? req.file.path : null;

        const user = await registerUser(
            req.body,
            idImageUrl
        );

        res.status(201).json({
            success: true,
            message: 'Account created',
            data: user,
        });
    } catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }

        const { token, user } = await loginUser(req.body);

        res.json({
            success: true,
            data: {
                token,
                user,
            },
        });
    } catch (err) {
        next(err);
    }
}

async function me(req, res) {
    const { password, ...safeUser } = req.user;

    res.json({
        success: true,
        data: safeUser,
    });
}

async function verifyEmail(req, res, next) {
    try {
        const user = await verifyEmailService(req.params.token);
        res.json({ success: true, message: 'Email verified', data: user });
    } catch (err) {
        next(err);
    }
}


export default {
    register,
    login,
    me,
    verifyEmail
};