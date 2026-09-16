import prisma from '../../config/db.js';

// These roles are required by the application.
const PROTECTED_ROLE_NAMES = ['member', 'admin'];

function shapeRole(role) {
    return {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions.map(
            ({ permission }) => permission
        ),
        userCount: role._count?.users ?? 0,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
    };
}

async function listRoles() {
    const roles = await prisma.role.findMany({
        include: {
            permissions: {
                include: {
                    permission: true,
                },
            },
            _count: {
                select: {
                    users: true,
                },
            },
        },
        orderBy: {
            name: 'asc',
        },
    });

    return roles.map(shapeRole);
}

async function getRoleById(id) {
    const role = await prisma.role.findUnique({
        where: { id },
        include: {
            permissions: {
                include: {
                    permission: true,
                },
            },
            _count: {
                select: {
                    users: true,
                },
            },
        },
    });

    if (!role) {
        const err = new Error('Role not found');
        err.status = 404;
        throw err;
    }

    return shapeRole(role);
}

async function createRole({
    name,
    description,
    permissionIds = [],
}) {
    const existing = await prisma.role.findUnique({
        where: { name },
    });

    if (existing) {
        const err = new Error(
            'A role with this name already exists'
        );
        err.status = 409;
        throw err;
    }

    const role = await prisma.$transaction(async (tx) => {
        const created = await tx.role.create({
            data: {
                name,
                description,
            },
        });

        if (permissionIds.length > 0) {
            await tx.rolePermission.createMany({
                data: permissionIds.map((permissionId) => ({
                    roleId: created.id,
                    permissionId,
                })),
            });
        }

        return tx.role.findUnique({
            where: { id: created.id },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
                _count: {
                    select: {
                        users: true,
                    },
                },
            },
        });
    });

    return shapeRole(role);
}

async function updateRole(
    id,
    { name, description, permissionIds }
) {
    const existingRole = await prisma.role.findUnique({
        where: { id },
    });

    if (!existingRole) {
        const err = new Error('Role not found');
        err.status = 404;
        throw err;
    }

    // Prevent renaming system roles.
    if (
        PROTECTED_ROLE_NAMES.includes(existingRole.name) &&
        name &&
        name !== existingRole.name
    ) {
        const err = new Error(
            `The "${existingRole.name}" role's name can't be changed — other parts of the app depend on it`
        );
        err.status = 400;
        throw err;
    }

    // If changing the name, make sure another role isn't already using it.
    if (name && name !== existingRole.name) {
        const nameTaken = await prisma.role.findUnique({
            where: { name },
        });

        if (nameTaken) {
            const err = new Error(
                'A role with this name already exists'
            );
            err.status = 409;
            throw err;
        }
    }

    const role = await prisma.$transaction(async (tx) => {
        await tx.role.update({
            where: { id },
            data: {
                name: name ?? existingRole.name,
                description:
                    description ?? existingRole.description,
            },
        });

        // If permissionIds was supplied, replace the role's permissions.
        if (Array.isArray(permissionIds)) {
            await tx.rolePermission.deleteMany({
                where: {
                    roleId: id,
                },
            });

            if (permissionIds.length > 0) {
                await tx.rolePermission.createMany({
                    data: permissionIds.map((permissionId) => ({
                        roleId: id,
                        permissionId,
                    })),
                });
            }
        }

        return tx.role.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
                _count: {
                    select: {
                        users: true,
                    },
                },
            },
        });
    });

    return shapeRole(role);
}

async function deleteRole(id) {
    const existingRole = await prisma.role.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    users: true,
                },
            },
        },
    });

    if (!existingRole) {
        const err = new Error('Role not found');
        err.status = 404;
        throw err;
    }

    // Never allow system roles to be deleted.
    if (PROTECTED_ROLE_NAMES.includes(existingRole.name)) {
        const err = new Error(
            `The "${existingRole.name}" role is required by the system and can't be deleted`
        );
        err.status = 400;
        throw err;
    }

    // Don't delete a role that is still assigned to users.
    if (existingRole._count.users > 0) {
        const err = new Error(
            'This role is still assigned to one or more users — reassign them first'
        );
        err.status = 409;
        throw err;
    }

    await prisma.role.delete({
        where: { id },
    });
}

export {
    listRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
};