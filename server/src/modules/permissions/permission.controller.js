import { listPermissions } from './permission.service.js';

async function list(req, res, next) {
    try {
        const permissions = await listPermissions();

        res.json({
            success: true,
            data: permissions,
        });
    } catch (err) {
        next(err);
    }
}

export { list };