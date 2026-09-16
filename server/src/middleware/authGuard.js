import { verifyToken } from '../utils/jwt.js';
import prisma from '../config/db.js';

async function authGuard(req, res, next) {
    try {
        const header = req.headers.authorization;

        if (!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided',
            });
        }

        const decoded = verifyToken(header.split(' ')[1]);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: {
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
            },
        });

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid session',
            });
        }

        req.user = user;
        next();
    } catch {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
}


function requirePermission(permissionName) {
    return (req, res, next) => {
        const permissions = req.user.roles.flatMap((ur) =>
            ur.role.permissions.map((rp) => rp.permission.name)
        );

        if (!permissions.includes(permissionName)) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden',
            });
        }

        next();
    };
}

export { authGuard, requirePermission };