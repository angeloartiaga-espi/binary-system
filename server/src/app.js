import express from 'express';
import cors from 'cors';

import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import errorHandler from './middleware/errorHandler.js';
import roleRoutes from './modules/roles/role.routes.js';
import permissionRoutes from './modules/permissions/permission.routes.js';

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
    })
);

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use(errorHandler); // must be last

export default app;