import prisma from '../../config/db.js';

async function listPermissions() {
    return prisma.permission.findMany({
        orderBy: {
            name: 'asc',
        },
    });
}

export { listPermissions };