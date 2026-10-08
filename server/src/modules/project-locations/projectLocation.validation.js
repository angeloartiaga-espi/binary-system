import { body, query } from "express-validator";

const STATUSES = ["OPEN", "SOLD", "RE_OPEN", "HOLD", "RESERVED", "RFO"];

const createValidation = [
  body("projectName").trim().notEmpty().withMessage("Project name is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),

  body("totalLotAreaSqm")
    .notEmpty()
    .withMessage("Total lot area is required")
    .isFloat({ min: 0 })
    .withMessage("Total lot area must be a positive number")
    .toFloat(),

  body("description").optional({ checkFalsy: true }).isString(),

  body("status")
    .optional({ checkFalsy: true })
    .isIn(STATUSES)
    .withMessage(`Status must be one of: ${STATUSES.join(", ")}`),
];

// Same rules, every field optional.
const updateValidation = [
  body("projectName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Project name cannot be empty"),
  body("location")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Location cannot be empty"),
  body("totalLotAreaSqm")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Total lot area must be a positive number")
    .toFloat(),
  body("description").optional({ checkFalsy: true }).isString(),
  body("status")
    .optional({ checkFalsy: true })
    .isIn(STATUSES)
    .withMessage(`Status must be one of: ${STATUSES.join(", ")}`),
];

const listValidation = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("status").optional({ checkFalsy: true }).isIn(STATUSES),
];

export { createValidation, updateValidation, listValidation, STATUSES };
