import { body } from "express-validator";

const permissionValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Permission name is required")
    .matches(/^[a-z0-9_]+$/)
    .withMessage(
      "Use lowercase letters, numbers and underscores only (e.g. manage_reports)",
    ),

  body("description").optional({ checkFalsy: true }).isString(),
];

const assignPermissionsValidation = [
  body("roleId").trim().notEmpty().withMessage("A role must be selected"),

  body("permissionIds").isArray().withMessage("permissionIds must be an array"),
];

export { permissionValidation, assignPermissionsValidation };
