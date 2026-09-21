import express from "express";

import { authGuard, requirePermission } from "../../middleware/authGuard.js";

import {
  permissionValidation,
  assignPermissionsValidation,
} from "./permission.validation.js";

import * as controller from "./permission.controller.js";

const router = express.Router();

router.use(authGuard, requirePermission("manage_permissions"));

// These MUST come before "/:id".
// Otherwise GET /permissions/assignable-roles
// would be captured by the "/:id" route and treated
// as a permission ID.
router.get("/assignable-roles", controller.assignableRoles);

router.post("/assign", assignPermissionsValidation, controller.assign);

router.get("/", controller.list);

router.get("/:id", controller.getOne);

router.post("/", permissionValidation, controller.create);

router.put("/:id", permissionValidation, controller.update);

router.delete("/:id", controller.remove);

export default router;
