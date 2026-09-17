import express from "express";

import { authGuard, requirePermission } from "../../middleware/authGuard.js";

import { roleValidation, assignRoleValidation } from "./role.validation.js";

import {
  list,
  getOne,
  create,
  update,
  remove,
  assign,
  assignableUsers,
} from "./role.controller.js";

const router = express.Router();

router.use(authGuard, requirePermission("manage_roles"));

// IMPORTANT: before /:id
router.get("/assignable-users", assignableUsers);
router.post("/assign", assignRoleValidation, assign);
router.get("/", list);
router.get("/:id", getOne);
router.post("/", roleValidation, create);
router.put("/:id", roleValidation, update);
router.delete("/:id", remove);

export default router;
