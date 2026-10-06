import { body, query } from "express-validator";

const STATUSES = ["ACTIVE", "INACTIVE", "COMPLETED"];

// Decimal fields arrive as strings/numbers from JSON — isFloat accepts
// either, and toFloat() normalizes the value before it reaches the service.
const createValidation = [
  body("projectName").trim().notEmpty().withMessage("Project name is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),

  body("totalLotAreaSqm")
    .notEmpty()
    .withMessage("Total lot area is required")
    .isFloat({ min: 0 })
    .withMessage("Total lot area must be a positive number")
    .toFloat(),

  body("roadAreaSqm")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Road area must be a positive number")
    .toFloat(),

  // Optional — if omitted, the service derives it as totalLotAreaSqm - roadAreaSqm.
  body("availableLotAreaSqm")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Available lot area must be a positive number")
    .toFloat(),

  body("description").optional({ checkFalsy: true }).isString(),

  body("status")
    .optional({ checkFalsy: true })
    .isIn(STATUSES)
    .withMessage(`Status must be one of: ${STATUSES.join(", ")}`),

  // Cross-field check: road + available can't exceed the total.
  body().custom((data) => {
    const total = Number(data.totalLotAreaSqm);
    const road = data.roadAreaSqm ? Number(data.roadAreaSqm) : 0;
    const available = data.availableLotAreaSqm
      ? Number(data.availableLotAreaSqm)
      : null;

    if (road > total)
      throw new Error("Road area cannot exceed the total lot area");
    if (available !== null && available > total) {
      throw new Error("Available lot area cannot exceed the total lot area");
    }
    return true;
  }),
];

// Same rules, every field optional (PUT behaves like a partial update here).
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
  body("totalLotAreaSqm").optional().isFloat({ min: 0 }).toFloat(),
  body("roadAreaSqm")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .toFloat(),
  body("availableLotAreaSqm")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
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
