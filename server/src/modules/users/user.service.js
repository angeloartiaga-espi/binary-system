import prisma from '../../config/db.js';
import { hashPassword } from '../../utils/password.js';
import { generateReferralCode } from '../../utils/referralCode.js';

function sanitize(user) {
    const { password, ...rest } = user;
    return rest;
}

async function listUsers({ page = 1, limit = 10, search = '' }) {
    const skip = (page - 1) * limit;

    const where = search
        ? {
            OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ],
        }
        : {};

    const [items, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
            include: {
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        }),

        prisma.user.count({ where }),
    ]);

    return {
        items: items.map(sanitize),
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit) || 1,
    };
}

async function getUserById(id) {
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            roles: {
                include: {
                    role: true,
                },
            },
        },
    });

    if (!user) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
    }

    return sanitize(user);
}

// Admin-created user — same shape as self-registration but callable
// directly, and lets the admin set membershipStatus/role up front.
async function createUser(data) {
    const existing = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (existing) {
        const err = new Error('A user with this email already exists');
        err.status = 409;
        throw err;
    }

    const hashedPassword = await hashPassword(data.password);
    const referralCode = generateReferralCode(data.firstName);

    const roleName = data.role || 'client';

    const role = await prisma.role.findUnique({
        where: { name: roleName },
    });

    if (!role) {
        const err = new Error(
            `Role "${roleName}" does not exist — run the seed script`
        );
        err.status = 400;
        throw err;
    }

    const user = await prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                password: hashedPassword,
                referralCode,
                membershipStatus: data.membershipStatus || 'BRONZE',
                privacyConsent: true,
                consentDate: new Date(),
                privacyNoticeVersion: 'admin-created',
            },
        });

        await tx.userRole.create({
            data: {
                userId: created.id,
                roleId: role.id,
            },
        });

        return created;
    });

    return sanitize(user);
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

    const updateData = {
        firstName: data.firstName ?? existingUser.firstName,
        lastName: data.lastName ?? existingUser.lastName,
        email: data.email ?? existingUser.email,
        phone: data.phone ?? existingUser.phone,
        membershipStatus:
            data.membershipStatus ?? existingUser.membershipStatus,
    };

    // Only re-hash and update the password if a new one was actually sent.
    if (data.password) {
        updateData.password = await hashPassword(data.password);
    }

    const updated = await prisma.user.update({
        where: { id },
        data: updateData,
    });

    return sanitize(updated);
}

// Soft delete: flips isActive to false instead of removing the row.
async function deleteUser(id) {
    const existingUser = await prisma.user.findUnique({
        where: { id },
    });

    if (!existingUser) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
    }

    await prisma.user.update({
        where: { id },
        data: { isActive: false },
    });
}

export {
    listUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};