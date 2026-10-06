import express from "express";
import { authGuard, requirePermission } from "../../middleware/authGuard.js";
import {
  createValidation,
  updateValidation,
  listValidation,
} from "./projectLocation.validation.js";
import * as controller from "./projectLocation.controller.js";

const router = express.Router();

// Change 'manage_properties' here if your seeded permission uses a
// different name — this is the one assumption I made without confirming.
router.use(authGuard, requirePermission("manage_properties"));

router.get("/", listValidation, controller.list);
router.get("/:id", controller.getOne);
router.post("/", createValidation, controller.create);
router.put("/:id", updateValidation, controller.update);
router.delete("/:id", controller.remove);

export default router;
