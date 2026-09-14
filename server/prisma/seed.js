import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    // ==========================================
    // 1. CREATE PERMISSIONS
    // ==========================================

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
            create: {
                name,
            },
        });
    }

    // ==========================================
    // 2. CREATE ROLES
    // ==========================================

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

    // ==========================================
    // 3. CLIENT ROLE PERMISSION
    // ==========================================

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

    // ==========================================
    // 4. ADMIN ROLE PERMISSIONS
    // ==========================================

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

    // ==========================================
    // 5. CREATE ADMIN USER
    // ==========================================

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
        throw new Error(
            "ADMIN_PASSWORD is not defined in your .env file."
        );
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const adminUser = await prisma.user.upsert({
        where: {
            email: "admin@espi.com.ph",
        },
        update: {
            firstName: "ESPI",
            lastName: "Administrator",
            password: hashedPassword,
            isActive: true,
            emailVerified: true,
            membershipStatus: "PLATINUM",
        },
        create: {
            firstName: "ESPI",
            lastName: "Administrator",
            email: "admin@espi.com.ph",
            password: hashedPassword,
            referralCode: "ESPIADMIN",
            membershipStatus: "PLATINUM",
            privacyConsent: true,
            consentDate: new Date(),
            privacyNoticeVersion: "v1.0-2026",
            isActive: true,
            emailVerified: true,
            roles: {
                create: {
                    roleId: adminRole.id,
                },
            },
        },
    });

    // ==========================================
    // 6. ENSURE ADMIN ROLE IS ATTACHED
    // ==========================================

    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: adminUser.id,
                roleId: adminRole.id,
            },
        },
        update: {},
        create: {
            userId: adminUser.id,
            roleId: adminRole.id,
        },
    });

    console.log(
        'Seed complete: "client" and "admin" roles + permissions are ready.'
    );

    console.log(`Admin user created/updated: ${adminUser.email}`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });