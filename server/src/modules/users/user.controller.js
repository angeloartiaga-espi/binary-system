import { validationResult } from 'express-validator';
import {    listUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser, } from './user.service.js';

async function list(req, res, next) {
    try {
        const { page, limit, search } = req.query;

        const result = await listUsers({
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            search,
        });

        res.json({
            success: true,
            data: result,
        });
    } catch (err) {
        next(err);
    }
}

async function getOne(req, res, next) {
    try {
        const user = await getUserById(req.params.id);

        res.json({
            success: true,
            data: user,
        });
    } catch (err) {
        next(err);
    }
}

async function create(req, res, next) {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }

        const user = await createUser(req.body);

        res.status(201).json({
            success: true,
            data: user,
        });
    } catch (err) {
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }

        const user = await updateUser(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            data: user,
        });
    } catch (err) {
        next(err);
    }
}

async function remove(req, res, next) {
    try {
        await deleteUser(req.params.id);

        res.json({
            success: true,
            message: 'User deactivated',
        });
    } catch (err) {
        next(err);
    }
}

export default {
    list,
    getOne,
    create,
    update,
    remove,
};