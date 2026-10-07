import express from "express";
import { authGuard, requirePermission } from "../../middleware/authGuard.js";
import {
  createValidation,
  updateValidation,
  listValidation,
} from "./lot.validation.js";
import * as controller from "./lot.controller.js";

const router = express.Router();

// Same permission as project locations — a lot only exists within one.
router.use(authGuard, requirePermission("manage_properties"));

router.get("/", listValidation, controller.list);
router.get("/:id", controller.getOne);
router.post("/", createValidation, controller.create);
router.put("/:id", updateValidation, controller.update);
router.delete("/:id", controller.remove);

export default router;
