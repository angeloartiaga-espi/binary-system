import { body } from 'express-validator';

const registerValidation = [
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

    body('phone')
        .optional({ checkFalsy: true })
        .isString(),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters'),

    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }

            return true;
        }),

    // Sent as a string "true" because this comes from multipart/form-data
    body('privacyConsent')
        .custom((value) => value === 'true' || value === true)
        .withMessage('You must accept the Privacy Notice to continue'),
];

const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Valid email is required'),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

export { registerValidation, loginValidation };