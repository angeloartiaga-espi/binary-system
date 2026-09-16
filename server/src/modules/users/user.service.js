
import prisma from '../../config/db.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { generateReferralCode } from '../../utils/referralCode.js';
import { signToken, verifyToken } from '../../utils/jwt.js';
import { sendVerificationEmail } from '../../utils/email.js';

const PRIVACY_NOTICE_VERSION = 'v1.0-2026';

/**
 * Get a user with their roles and permissions.
 *
 * User
 *  └── UserRole
 *       └── Role
 *            └── RolePermission
 *                 └── Permission
 */
const userWithRolesAndPermissions = {
    roles: {
        include: {
            role: {
                include: {
                    permissions: {
                        include: {
                            permission: true,
                        },
                    },
                },
            },
        },
    },
};

/**
 * Remove sensitive information before returning a user.
 */
function sanitizeUser(user) {
    const { password: _pw, ...safeUser } = user;
    return safeUser;
}

/**
 * Register a new client account.
 *
 * Process:
 * 1. Check if email already exists
 * 2. Hash password
 * 3. Generate referral code
 * 4. Find default client role
 * 5. Create user
 * 6. Assign client role
 * 7. Save privacy consent
 * 8. Generate email verification token
 * 9. Send verification email
 */
async function registerUser(
    {
        firstName,
        lastName,
        email,
        phone,
        password,
        referrerCode,
    },
    idImageUrl
) {
    const existing = await prisma.user.findUnique({
        where: { email },
    });

    if (existing) {
        const err = new Error(
            'An account with this email already exists'
        );
        err.status = 409;
        throw err;
    }

    const hashedPassword = await hashPassword(password);
    const referralCode = generateReferralCode(firstName);

    // Every self-registered user starts with the client role.
    const clientRole = await prisma.role.findUnique({
        where: { name: 'client' },
    });

    if (!clientRole) {
        const err = new Error(
            'Default "client" role not found — run "npx prisma db seed" first'
        );
        err.status = 500;
        throw err;
    }

    /**
     * User creation and role assignment happen in one transaction.
     *
     * If either operation fails, neither is committed.
     * This prevents users from being created without a role.
     */
    const user = await prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
            data: {
                firstName,
                lastName,
                email,
                phone,
                password: hashedPassword,
                idImage: idImageUrl,

                // Referral / membership
                referralCode,
                referrerCode: referrerCode || null,
                membershipStatus: 'BRONZE',

                // Privacy
                privacyConsent: true,
                consentDate: new Date(),
                privacyNoticeVersion: PRIVACY_NOTICE_VERSION,

                // Email verification
                emailVerified: false,
            },
        });

        await tx.userRole.create({
            data: {
                userId: created.id,
                roleId: clientRole.id,
            },
        });

        return created;
    });

    /**
     * Generate a verification token that expires after 24 hours.
     *
     * "purpose" prevents this token from being accidentally
     * accepted by another token-based endpoint.
     */
    const verifyToken = signToken(
        {
            id: user.id,
            purpose: 'verify-email',
        },
        '1d'
    );

    const verifyUrl =
        `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;

    // Email failure should not cause registration to fail.
    sendVerificationEmail(
        user.email,
        user.firstName,
        verifyUrl
    ).catch((err) => {
        console.error(
            'Failed to send verification email:',
            err.message
        );
    });

    return sanitizeUser(user);
}

/**
 * Login user and return:
 *
 * {
 *   token,
 *   user: {
 *      ...user,
 *      roles: [
 *          {
 *              role: {
 *                  name,
 *                  permissions: [...]
 *              }
 *          }
 *      ]
 *   }
 * }
 */
async function loginUser({ email, password }) {
    const user = await prisma.user.findUnique({
        where: { email },
        include: userWithRolesAndPermissions,
    });

    // Do not reveal whether the email exists.
    if (!user || !user.isActive) {
        const err = new Error('Invalid email or password');
        err.status = 401;
        throw err;
    }

    const passwordMatches = await comparePassword(
        password,
        user.password
    );

    if (!passwordMatches) {
        const err = new Error('Invalid email or password');
        err.status = 401;
        throw err;
    }

    /**
     * Optional email verification enforcement.
     *
     * If you are not ready to prevent login before verification,
     * leave this commented for now.
     */
    /*
    if (!user.emailVerified) {
        const err = new Error('Please verify your email before logging in');
        err.status = 403;
        throw err;
    }
    */

    const token = signToken({
        id: user.id,
    });

    return {
        token,
        user: sanitizeUser(user),
    };
}

/**
 * Verify user's email address.
 */
async function verifyEmail(token) {
    let decoded;

    try {
        decoded = verifyToken(token);
    } catch {
        const err = new Error(
            'This verification link is invalid or has expired'
        );
        err.status = 400;
        throw err;
    }

    if (decoded.purpose !== 'verify-email') {
        const err = new Error('Invalid verification link');
        err.status = 400;
        throw err;
    }

    const user = await prisma.user.update({
        where: {
            id: decoded.id,
        },
        data: {
            emailVerified: true,
        },
    });

    return sanitizeUser(user);
}

async function updateUser(id, data) {
    const existingUser = await prisma.user.findUnique({
        where: { id },
    });

    if (!existingUser) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
    }

    if (data.email && data.email !== existingUser.email) {
        const emailTaken = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (emailTaken) {
            const err = new Error('That email is already in use');
            err.status = 409;
            throw err;
        }
    }

    // If a role was supplied, find it first.
    let newRole = null;

    if (data.role) {
        newRole = await prisma.role.findUnique({
            where: { name: data.role },
        });

        if (!newRole) {
            const err = new Error(
                `Role "${data.role}" does not exist`
            );
            err.status = 400;
            throw err;
        }
    }

    const updateData = {
        firstName: data.firstName ?? existingUser.firstName,
        lastName: data.lastName ?? existingUser.lastName,
        email: data.email ?? existingUser.email,
        phone: data.phone ?? existingUser.phone,
        membershipStatus:
            data.membershipStatus ?? existingUser.membershipStatus,
    };

    if (data.password) {
        updateData.password = await hashPassword(data.password);
    }

    const updated = await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
            where: { id },
            data: updateData,
        });

        if (newRole) {
            // The current UI uses one role per user.
            // Remove the old role and assign the new one.
            await tx.userRole.deleteMany({
                where: { userId: id },
            });

            await tx.userRole.create({
                data: {
                    userId: id,
                    roleId: newRole.id,
                },
            });
        }

        return user;
    });

    return sanitize(updated);
}

export {
    registerUser,
    loginUser,
    verifyEmail,
    updateUser
};

