import express from "express";
import cors from "cors";

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import errorHandler from "./middleware/errorHandler.js";
import roleRoutes from "./modules/roles/role.routes.js";
import permissionRoutes from "./modules/permissions/permission.routes.js";
import projectLocationRoutes from "./modules/project-locations/projectLocation.routes.js";
import lotRoutes from "./modules/lots/lot.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/project-locations", projectLocationRoutes);
app.use("/api/lots", lotRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler); // must be last

export default app;
