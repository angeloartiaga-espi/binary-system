[1mdiff --git a/server/src/app.js b/server/src/app.js[m
[1mindex a7fd91a..bed77ee 100644[m
[1m--- a/server/src/app.js[m
[1m+++ b/server/src/app.js[m
[36m@@ -4,6 +4,8 @@[m [mimport cors from 'cors';[m
 import authRoutes from './modules/auth/auth.routes.js';[m
 import userRoutes from './modules/users/user.routes.js';[m
 import errorHandler from './middleware/errorHandler.js';[m
[32m+[m[32mimport roleRoutes from './modules/roles/role.routes.js';[m
[32m+[m[32mimport permissionRoutes from './modules/permissions/permission.routes.js';[m
 [m
 const app = express();[m
 [m
[36m@@ -17,6 +19,8 @@[m [mapp.use(express.json());[m
 [m
 app.use('/api/auth', authRoutes);[m
 app.use('/api/users', userRoutes);[m
[32m+[m[32mapp.use('/api/roles', roleRoutes);[m
[32m+[m[32mapp.use('/api/permissions', permissionRoutes);[m
 [m
 app.get('/api/health', (req, res) => {[m
     res.json({ status: 'ok' });[m
[1mdiff --git a/server/src/middleware/authGuard.js b/server/src/middleware/authGuard.js[m
[1mindex ef31572..36d48a6 100644[m
[1m--- a/server/src/middleware/authGuard.js[m
[1m+++ b/server/src/middleware/authGuard.js[m
[36m@@ -50,6 +50,7 @@[m [masync function authGuard(req, res, next) {[m
     }[m
 }[m
 [m
[32m+[m
 function requirePermission(permissionName) {[m
     return (req, res, next) => {[m
         const permissions = req.user.roles.flatMap((ur) =>[m
[1mdiff --git a/server/src/modules/auth/auth.service.js b/server/src/modules/auth/auth.service.js[m
[1mindex f7c156d..8ed5867 100644[m
[1m--- a/server/src/modules/auth/auth.service.js[m
[1m+++ b/server/src/modules/auth/auth.service.js[m
[36m@@ -1,13 +1,69 @@[m
[32m+[m
 import prisma from '../../config/db.js';[m
 import { hashPassword, comparePassword } from '../../utils/password.js';[m
 import { generateReferralCode } from '../../utils/referralCode.js';[m
 import { signToken, verifyToken } from '../../utils/jwt.js';[m
[31m-import {  sendVerificationEmail } from '../../utils/email.js';[m
[32m+[m[32mimport { sendVerificationEmail } from '../../utils/email.js';[m
[32m+[m[32mimport { userAccessInclude } from './auth.constants.js';[m
 [m
 const PRIVACY_NOTICE_VERSION = 'v1.0-2026';[m
 [m
[32m+[m[32m/**[m
[32m+[m[32m * Get a user with their roles and permissions.[m
[32m+[m[32m *[m
[32m+[m[32m * User[m
[32m+[m[32m *  └── UserRole[m
[32m+[m[32m *       └── Role[m
[32m+[m[32m *            └── RolePermission[m
[32m+[m[32m *                 └── Permission[m
[32m+[m[32m */[m
[32m+[m[32mconst userWithRolesAndPermissions = {[m
[32m+[m[32m    roles: {[m
[32m+[m[32m        include: {[m
[32m+[m[32m            role: {[m
[32m+[m[32m                include: {[m
[32m+[m[32m                    permissions: {[m
[32m+[m[32m                        include: {[m
[32m+[m[32m                            permission: true,[m
[32m+[m[32m                        },[m
[32m+[m[32m                    },[m
[32m+[m[32m                },[m
[32m+[m[32m            },[m
[32m+[m[32m        },[m
[32m+[m[32m    },[m
[32m+[m[32m};[m
[32m+[m
[32m+[m[32m/**[m
[32m+[m[32m * Remove sensitive information before returning a user.[m
[32m+[m[32m */[m
[32m+[m[32mfunction sanitizeUser(user) {[m
[32m+[m[32m    const { password: _pw, ...safeUser } = user;[m
[32m+[m[32m    return safeUser;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m/**[m
[32m+[m[32m * Register a new client account.[m
[32m+[m[32m *[m
[32m+[m[32m * Process:[m
[32m+[m[32m * 1. Check if email already exists[m
[32m+[m[32m * 2. Hash password[m
[32m+[m[32m * 3. Generate referral code[m
[32m+[m[32m * 4. Find default client role[m
[32m+[m[32m * 5. Create user[m
[32m+[m[32m * 6. Assign client role[m
[32m+[m[32m * 7. Save privacy consent[m
[32m+[m[32m * 8. Generate email verification token[m
[32m+[m[32m * 9. Send verification email[m
[32m+[m[32m */[m
 async function registerUser([m
[31m-    { firstName, lastName, email, phone, password, referrerCode },[m
[32m+[m[32m    {[m
[32m+[m[32m        firstName,[m
[32m+[m[32m        lastName,[m
[32m+[m[32m        email,[m
[32m+[m[32m        phone,[m
[32m+[m[32m        password,[m
[32m+[m[32m        referrerCode,[m
[32m+[m[32m    },[m
     idImageUrl[m
 ) {[m
     const existing = await prisma.user.findUnique({[m
[36m@@ -15,7 +71,9 @@[m [masync function registerUser([m
     });[m
 [m
     if (existing) {[m
[31m-        const err = new Error('An account with this email already exists');[m
[32m+[m[32m        const err = new Error([m
[32m+[m[32m            'An account with this email already exists'[m
[32m+[m[32m        );[m
         err.status = 409;[m
         throw err;[m
     }[m
[36m@@ -23,16 +81,25 @@[m [masync function registerUser([m
     const hashedPassword = await hashPassword(password);[m
     const referralCode = generateReferralCode(firstName);[m
 [m
[32m+[m[32m    // Every self-registered user starts with the client role.[m
     const clientRole = await prisma.role.findUnique({[m
         where: { name: 'client' },[m
     });[m
 [m
     if (!clientRole) {[m
[31m-        throw new Error([m
[32m+[m[32m        const err = new Error([m
             'Default "client" role not found — run "npx prisma db seed" first'[m
         );[m
[32m+[m[32m        err.status = 500;[m
[32m+[m[32m        throw err;[m
     }[m
 [m
[32m+[m[32m    /**[m
[32m+[m[32m     * User creation and role assignment happen in one transaction.[m
[32m+[m[32m     *[m
[32m+[m[32m     * If either operation fails, neither is committed.[m
[32m+[m[32m     * This prevents users from being created without a role.[m
[32m+[m[32m     */[m
     const user = await prisma.$transaction(async (tx) => {[m
         const created = await tx.user.create({[m
             data: {[m
[36m@@ -42,12 +109,19 @@[m [masync function registerUser([m
                 phone,[m
                 password: hashedPassword,[m
                 idImage: idImageUrl,[m
[32m+[m
[32m+[m[32m                // Referral / membership[m
                 referralCode,[m
                 referrerCode: referrerCode || null,[m
                 membershipStatus: 'BRONZE',[m
[32m+[m
[32m+[m[32m                // Privacy[m
                 privacyConsent: true,[m
                 consentDate: new Date(),[m
                 privacyNoticeVersion: PRIVACY_NOTICE_VERSION,[m
[32m+[m
[32m+[m[32m                // Email verification[m
[32m+[m[32m                emailVerified: false,[m
             },[m
         });[m
 [m
[36m@@ -61,86 +135,116 @@[m [masync function registerUser([m
         return created;[m
     });[m
 [m
[31m-    // Verification link expires in 24 hours — shorter-lived than a login token.[m
[31m-    const verifyToken = signToken({ id: user.id, purpose: 'verify-email' }, '1d');[m
[31m-    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;[m
[31m-[m
[31m-    sendVerificationEmail(user.email, user.firstName, verifyUrl).catch((err) =>[m
[31m-        console.error('Failed to send verification email:', err.message)[m
[32m+[m[32m    /**[m
[32m+[m[32m     * Generate a verification token that expires after 24 hours.[m
[32m+[m[32m     *[m
[32m+[m[32m     * "purpose" prevents this token from being accidentally[m
[32m+[m[32m     * accepted by another token-based endpoint.[m
[32m+[m[32m     */[m
[32m+[m[32m    const verifyToken = signToken([m
[32m+[m[32m        {[m
[32m+[m[32m            id: user.id,[m
[32m+[m[32m            purpose: 'verify-email',[m
[32m+[m[32m        },[m
[32m+[m[32m        '1d'[m
     );[m
 [m
[31m-    const { password: _pw, ...safeUser } = user;[m
[31m-[m
[31m-    return safeUser;[m
[31m-}[m
[31m-[m
[31m-// async function loginUser({ email, password }) {[m
[31m-//     const user = await prisma.user.findUnique({[m
[31m-//         where: { email },[m
[31m-//     });[m
[31m-[m
[31m-//     if (!user || !user.isActive) {[m
[31m-//         const err = new Error('Invalid email or password');[m
[31m-//         err.status = 401;[m
[31m-//         throw err;[m
[31m-//     }[m
[32m+[m[32m    const verifyUrl =[m
[32m+[m[32m        `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;[m
 [m
[31m-//     if (!(await comparePassword(password, user.password))) {[m
[31m-//         const err = new Error('Invalid email or password');[m
[31m-//         err.status = 401;[m
[31m-//         throw err;[m
[31m-//     }[m
[31m-[m
[31m-//     const token = signToken({ id: user.id });[m
[31m-[m
[31m-//     const { password: _pw, ...safeUser } = user;[m
[32m+[m[32m    // Email failure should not cause registration to fail.[m
[32m+[m[32m    sendVerificationEmail([m
[32m+[m[32m        user.email,[m
[32m+[m[32m        user.firstName,[m
[32m+[m[32m        verifyUrl[m
[32m+[m[32m    ).catch((err) => {[m
[32m+[m[32m        console.error([m
[32m+[m[32m            'Failed to send verification email:',[m
[32m+[m[32m            err.message[m
[32m+[m[32m        );[m
[32m+[m[32m    });[m
 [m
[31m-//     return {[m
[31m-//         token,[m
[31m-//         user: safeUser,[m
[31m-//     };[m
[31m-// }[m
[32m+[m[32m    return sanitizeUser(user);[m
[32m+[m[32m}[m
 [m
[32m+[m[32m/**[m
[32m+[m[32m * Login user and return:[m
[32m+[m[32m *[m
[32m+[m[32m * {[m
[32m+[m[32m *   token,[m
[32m+[m[32m *   user: {[m
[32m+[m[32m *      ...user,[m
[32m+[m[32m *      roles: [[m
[32m+[m[32m *          {[m
[32m+[m[32m *              role: {[m
[32m+[m[32m *                  name,[m
[32m+[m[32m *                  permissions: [...][m
[32m+[m[32m *              }[m
[32m+[m[32m *          }[m
[32m+[m[32m *      ][m
[32m+[m[32m *   }[m
[32m+[m[32m * }[m
[32m+[m[32m */[m
 async function loginUser({ email, password }) {[m
     const user = await prisma.user.findUnique({[m
         where: { email },[m
[31m-        include: {[m
[31m-            roles: {[m
[31m-                include: {[m
[31m-                    role: true,[m
[31m-                },[m
[31m-            },[m
[31m-        },[m
[32m+[m[32m        include: userWithRolesAndPermissions,[m
     });[m
 [m
[32m+[m[32m    // Do not reveal whether the email exists.[m
     if (!user || !user.isActive) {[m
         const err = new Error('Invalid email or password');[m
         err.status = 401;[m
         throw err;[m
     }[m
 [m
[31m-    if (!(await comparePassword(password, user.password))) {[m
[32m+[m[32m    const passwordMatches = await comparePassword([m
[32m+[m[32m        password,[m
[32m+[m[32m        user.password[m
[32m+[m[32m    );[m
[32m+[m
[32m+[m[32m    if (!passwordMatches) {[m
         const err = new Error('Invalid email or password');[m
         err.status = 401;[m
         throw err;[m
     }[m
 [m
[31m-    const token = signToken({ id: user.id });[m
[32m+[m[32m    /**[m
[32m+[m[32m     * Optional email verification enforcement.[m
[32m+[m[32m     *[m
[32m+[m[32m     * If you are not ready to prevent login before verification,[m
[32m+[m[32m     * leave this commented for now.[m
[32m+[m[32m     */[m
[32m+[m[32m    /*[m
[32m+[m[32m    if (!user.emailVerified) {[m
[32m+[m[32m        const err = new Error('Please verify your email before logging in');[m
[32m+[m[32m        err.status = 403;[m
[32m+[m[32m        throw err;[m
[32m+[m[32m    }[m
[32m+[m[32m    */[m
 [m
[31m-    const { password: _pw, ...safeUser } = user;[m
[32m+[m[32m    const token = signToken({[m
[32m+[m[32m        id: user.id,[m
[32m+[m[32m    });[m
 [m
     return {[m
         token,[m
[31m-        user: safeUser,[m
[32m+[m[32m        user: sanitizeUser(user),[m
     };[m
 }[m
 [m
[32m+[m[32m/**[m
[32m+[m[32m * Verify user's email address.[m
[32m+[m[32m */[m
 async function verifyEmail(token) {[m
     let decoded;[m
[32m+[m
     try {[m
         decoded = verifyToken(token);[m
     } catch {[m
[31m-        const err = new Error('This verification link is invalid or has expired');[m
[32m+[m[32m        const err = new Error([m
[32m+[m[32m            'This verification link is invalid or has expired'[m
[32m+[m[32m        );[m
         err.status = 400;[m
         throw err;[m
     }[m
[36m@@ -152,12 +256,20 @@[m [masync function verifyEmail(token) {[m
     }[m
 [m
     const user = await prisma.user.update({[m
[31m-        where: { id: decoded.id },[m
[31m-        data: { emailVerified: true },[m
[32m+[m[32m        where: {[m
[32m+[m[32m            id: decoded.id,[m
[32m+[m[32m        },[m
[32m+[m[32m        data: {[m
[32m+[m[32m            emailVerified: true,[m
[32m+[m[32m        },[m
     });[m
 [m
[31m-    const { password: _pw, ...safeUser } = user;[m
[31m-    return safeUser;[m
[32m+[m[32m    return sanitizeUser(user);[m
 }[m
 [m
[31m-export { registerUser, loginUser, verifyEmail };[m
\ No newline at end of file[m
[32m+[m[32mexport {[m
[32m+[m[32m    registerUser,[m
[32m+[m[32m    loginUser,[m
[32m+[m[32m    verifyEmail,[m
[32m+[m[32m};[m
[41m+[m
[1mdiff --git a/server/src/modules/users/user.service.js b/server/src/modules/users/user.service.js[m
[1mindex bae9ee0..b6f2600 100644[m
[1m--- a/server/src/modules/users/user.service.js[m
[1m+++ b/server/src/modules/users/user.service.js[m
[36m@@ -1,129 +1,269 @@[m
[32m+[m
 import prisma from '../../config/db.js';[m
[31m-import { hashPassword } from '../../utils/password.js';[m
[32m+[m[32mimport { hashPassword, comparePassword } from '../../utils/password.js';[m
 import { generateReferralCode } from '../../utils/referralCode.js';[m
[32m+[m[32mimport { signToken, verifyToken } from '../../utils/jwt.js';[m
[32m+[m[32mimport { sendVerificationEmail } from '../../utils/email.js';[m
 [m
[31m-function sanitize(user) {[m
[31m-    const { password, ...rest } = user;[m
[31m-    return rest;[m
[31m-}[m
[31m-[m
[31m-async function listUsers({ page = 1, limit = 10, search = '' }) {[m
[31m-    const skip = (page - 1) * limit;[m
[31m-[m
[31m-    const where = search[m
[31m-        ? {[m
[31m-            OR: [[m
[31m-                { firstName: { contains: search, mode: 'insensitive' } },[m
[31m-                { lastName: { contains: search, mode: 'insensitive' } },[m
[31m-                { email: { contains: search, mode: 'insensitive' } },[m
[31m-            ],[m
[31m-        }[m
[31m-        : {};[m
[31m-[m
[31m-    const [items, total] = await Promise.all([[m
[31m-        prisma.user.findMany({[m
[31m-            where,[m
[31m-            skip,[m
[31m-            take: Number(limit),[m
[31m-            orderBy: { createdAt: 'desc' },[m
[31m-            include: {[m
[31m-                roles: {[m
[31m-                    include: {[m
[31m-                        role: true,[m
[31m-                    },[m
[31m-                },[m
[31m-            },[m
[31m-        }),[m
[31m-[m
[31m-        prisma.user.count({ where }),[m
[31m-    ]);[m
[31m-[m
[31m-    return {[m
[31m-        items: items.map(sanitize),[m
[31m-        total,[m
[31m-        page: Number(page),[m
[31m-        totalPages: Math.ceil(total / limit) || 1,[m
[31m-    };[m
[31m-}[m
[32m+[m[32mconst PRIVACY_NOTICE_VERSION = 'v1.0-2026';[m
 [m
[31m-async function getUserById(id) {[m
[31m-    const user = await prisma.user.findUnique({[m
[31m-        where: { id },[m
[32m+[m[32m/**[m
[32m+[m[32m * Get a user with their roles and permissions.[m
[32m+[m[32m *[m
[32m+[m[32m * User[m
[32m+[m[32m *  └── UserRole[m
[32m+[m[32m *       └── Role[m
[32m+[m[32m *            └── RolePermission[m
[32m+[m[32m *                 └── Permission[m
[32m+[m[32m */[m
[32m+[m[32mconst userWithRolesAndPermissions = {[m
[32m+[m[32m    roles: {[m
         include: {[m
[31m-            roles: {[m
[32m+[m[32m            role: {[m
                 include: {[m
[31m-                    role: true,[m
[32m+[m[32m                    permissions: {[m
[32m+[m[32m                        include: {[m
[32m+[m[32m                            permission: true,[m
[32m+[m[32m                        },[m
[32m+[m[32m                    },[m
                 },[m
             },[m
         },[m
[31m-    });[m
[31m-[m
[31m-    if (!user) {[m
[31m-        const err = new Error('User not found');[m
[31m-        err.status = 404;[m
[31m-        throw err;[m
[31m-    }[m
[32m+[m[32m    },[m
[32m+[m[32m};[m
 [m
[31m-    return sanitize(user);[m
[32m+[m[32m/**[m
[32m+[m[32m * Remove sensitive information before returning a user.[m
[32m+[m[32m */[m
[32m+[m[32mfunction sanitizeUser(user) {[m
[32m+[m[32m    const { password: _pw, ...safeUser } = user;[m
[32m+[m[32m    return safeUser;[m
 }[m
 [m
[31m-// Admin-created user — same shape as self-registration but callable[m
[31m-// directly, and lets the admin set membershipStatus/role up front.[m
[31m-async function createUser(data) {[m
[32m+[m[32m/**[m
[32m+[m[32m * Register a new client account.[m
[32m+[m[32m *[m
[32m+[m[32m * Process:[m
[32m+[m[32m * 1. Check if email already exists[m
[32m+[m[32m * 2. Hash password[m
[32m+[m[32m * 3. Generate referral code[m
[32m+[m[32m * 4. Find default client role[m
[32m+[m[32m * 5. Create user[m
[32m+[m[32m * 6. Assign client role[m
[32m+[m[32m * 7. Save privacy consent[m
[32m+[m[32m * 8. Generate email verification token[m
[32m+[m[32m * 9. Send verification email[m
[32m+[m[32m */[m
[32m+[m[32masync function registerUser([m
[32m+[m[32m    {[m
[32m+[m[32m        firstName,[m
[32m+[m[32m        lastName,[m
[32m+[m[32m        email,[m
[32m+[m[32m        phone,[m
[32m+[m[32m        password,[m
[32m+[m[32m        referrerCode,[m
[32m+[m[32m    },[m
[32m+[m[32m    idImageUrl[m
[32m+[m[32m) {[m
     const existing = await prisma.user.findUnique({[m
[31m-        where: { email: data.email },[m
[32m+[m[32m        where: { email },[m
     });[m
 [m
     if (existing) {[m
[31m-        const err = new Error('A user with this email already exists');[m
[32m+[m[32m        const err = new Error([m
[32m+[m[32m            'An account with this email already exists'[m
[32m+[m[32m        );[m
         err.status = 409;[m
         throw err;[m
     }[m
 [m
[31m-    const hashedPassword = await hashPassword(data.password);[m
[31m-    const referralCode = generateReferralCode(data.firstName);[m
[31m-[m
[31m-    const roleName = data.role || 'client';[m
[32m+[m[32m    const hashedPassword = await hashPassword(password);[m
[32m+[m[32m    const referralCode = generateReferralCode(firstName);[m
 [m
[31m-    const role = await prisma.role.findUnique({[m
[31m-        where: { name: roleName },[m
[32m+[m[32m    // Every self-registered user starts with the client role.[m
[32m+[m[32m    const clientRole = await prisma.role.findUnique({[m
[32m+[m[32m        where: { name: 'client' },[m
     });[m
 [m
[31m-    if (!role) {[m
[32m+[m[32m    if (!clientRole) {[m
         const err = new Error([m
[31m-            `Role "${roleName}" does not exist — run the seed script`[m
[32m+[m[32m            'Default "client" role not found — run "npx prisma db seed" first'[m
         );[m
[31m-        err.status = 400;[m
[32m+[m[32m        err.status = 500;[m
         throw err;[m
     }[m
 [m
[32m+[m[32m    /**[m
[32m+[m[32m     * User creation and role assignment happen in one transaction.[m
[32m+[m[32m     *[m
[32m+[m[32m     * If either operation fails, neither is committed.[m
[32m+[m[32m     * This prevents users from being created without a role.[m
[32m+[m[32m     */[m
     const user = await prisma.$transaction(async (tx) => {[m
         const created = await tx