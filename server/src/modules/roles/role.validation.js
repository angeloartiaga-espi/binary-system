import { body } from 'express-validator';

const roleValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Role name is required'),

    body('description')
        .optional({ checkFalsy: true })
        .isString()
        .withMessage('Description must be a string'),

    body('permissionIds')
        .optional()
        .isArray()
        .withMessage('permissionIds must be an array'),
];

export { roleValidation };