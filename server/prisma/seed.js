import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    const permissionNames = [
        "view_dashboard",
        "manage_users",
        "manage_properties",
    ];

    const permissions = {};

    for (const name of permissionNames) {
        permissions[name] = await prisma.permission.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }

    const clientRole = await prisma.role.upsert({
        where: { name: "client" },
        update: {},
        create: {
            name: "client",
            description: "Default role for self-registered users",
        },
    });

    const adminRole = await prisma.role.upsert({
        where: { name: "admin" },
        update: {},
        create: {
            name: "admin",
            description: "Manages users, properties and listings",
        },
    });

    await prisma.rolePermission.upsert({
        where: {
            roleId_permissionId: {
                roleId: clientRole.id,
                permissionId: permissions.view_dashboard.id,
            },
        },
        update: {},
        create: {
            roleId: clientRole.id,
            permissionId: permissions.view_dashboard.id,
        },
    });

    for (const name of permissionNames) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: adminRole.id,
                    permissionId: permissions[name].id,
                },
            },
            update: {},
            create: {
                roleId: adminRole.id,
                permissionId: permissions[name].id,
            },
        });
    }

    console.log(
        'Seed complete: "client" and "admin" roles + permissions are ready.'
    );
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });