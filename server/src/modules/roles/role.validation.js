import { body } from "express-validator";

const roleValidation = [
  body("name").trim().notEmpty().withMessage("Role name is required"),

  body("description")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Description must be a string"),

  body("permissionIds")
    .optional()
    .isArray()
    .withMessage("permissionIds must be an array"),
];

const assignRoleValidation = [
  body("userId").trim().notEmpty().withMessage("A user must be selected"),

  body("role").trim().notEmpty().withMessage("A role must be selected"),
];

export { roleValidation, assignRoleValidation };
