import { body } from 'express-validator';

const createUserValidation = [
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('First name is required'),

    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Last name is required'),

    body('email')
        .isEmail()
        .withMessage('Valid email is required'),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters'),
];

const updateUserValidation = [
    body('firstName')
        .optional()
        .trim()
        .notEmpty(),

    body('lastName')
        .optional()
        .trim()
        .notEmpty(),

    body('email')
        .optional()
        .isEmail(),

    body('phone')
        .optional()
        .isString(),

    body('membershipStatus')
        .optional()
        .isIn(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']),

    body('password')
        .optional()
        .isLength({ min: 8 }),
];

export {
    createUserValidation,
    updateUserValidation,
};