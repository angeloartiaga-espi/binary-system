import { body, query } from "express-validator";

const STATUSES = ["OPEN", "SOLD", "RE_OPEN", "HOLD", "RESERVED"];

const createValidation = [
  body("projectLocationId")
    .trim()
    .notEmpty()
    .withMessage("A project location is required"),
  body("lotNumber").trim().notEmpty().withMessage("Lot number is required"),

  body("lotAreaSqm")
    .notEmpty()
    .withMessage("Lot area is required")
    .isFloat({ min: 0 })
    .withMessage("Lot area must be a positive number")
    .toFloat(),

  body("status")
    .optional({ checkFalsy: true })
    .isIn(STATUSES)
    .withMessage(`Status must be one of: ${STATUSES.join(", ")}`),

  body("remarks").optional({ checkFalsy: true }).isString(),
];

// projectLocationId is intentionally NOT editable here — a lot doesn't
// move between projects, it gets deleted from one and recreated in
// another if that's ever needed.
const updateValidation = [
  body("lotNumber")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Lot number cannot be empty"),
  body("lotAreaSqm")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Lot area must be a positive number")
    .toFloat(),
  body("status")
    .optional({ checkFalsy: true })
    .isIn(STATUSES)
    .withMessage(`Status must be one of: ${STATUSES.join(", ")}`),
  body("remarks").optional({ checkFalsy: true }).isString(),
];

const listValidation = [
  query("projectLocationId")
    .trim()
    .notEmpty()
    .withMessage("projectLocationId is required"),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("status").optional({ checkFalsy: true }).isIn(STATUSES),
];

export { createValidation, updateValidation, listValidation, STATUSES };
