import prisma from '../../config/db.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { generateReferralCode } from '../../utils/referralCode.js';
import { signToken } from '../../utils/jwt.js';
import { sendWelcomeEmail } from '../../utils/email.js';

const PRIVACY_NOTICE_VERSION = 'v1.0-2026';

async function registerUser(
    { firstName, lastName, email, phone, password, referrerCode },
    idImageUrl
) {
    const existing = await prisma.user.findUnique({
        where: { email },
    });

    if (existing) {
        const err = new Error('An account with this email already exists');
        err.status = 409;
        throw err;
    }

    const hashedPassword = await hashPassword(password);
    const referralCode = generateReferralCode(firstName);

    const clientRole = await prisma.role.findUnique({
        where: { name: 'client' },
    });

    if (!clientRole) {
        throw new Error(
            'Default "client" role not found — run "npx prisma db seed" first'
        );
    }

    const user = await prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
            data: {
                firstName,
                lastName,
                email,
                phone,
                password: hashedPassword,
                idImage: idImageUrl,
                referralCode,
                referrerCode: referrerCode || null,
                membershipStatus: 'BRONZE',
                privacyConsent: true,
                consentDate: new Date(),
                privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
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

    sendWelcomeEmail(user.email, user.firstName).catch((err) =>
        console.error('Welcome email failed:', err.message)
    );

    const { password: _pw, ...safeUser } = user;

    return safeUser;
}

async function loginUser({ email, password }) {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user || !user.isActive) {
        const err = new Error('Invalid email or password');
        err.status = 401;
        throw err;
    }

    if (!(await comparePassword(password, user.password))) {
        const err = new Error('Invalid email or password');
        err.status = 401;
        throw err;
    }

    const token = signToken({ id: user.id });

    const { password: _pw, ...safeUser } = user;

    return {
        token,
        user: safeUser,
    };
}

export { registerUser, loginUser };