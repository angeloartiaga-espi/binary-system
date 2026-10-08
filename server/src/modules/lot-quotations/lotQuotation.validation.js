import { body, param, query } from "express-validator";

const createLotQuotationValidation = [
  body("lotId")
    .notEmpty()
    .withMessage("Lot ID is required")
    .isUUID()
    .withMessage("Lot ID must be a valid UUID"),

  body("floorAreaSqm")
    .notEmpty()
    .withMessage("Floor area is required")
    .isDecimal()
    .withMessage("Floor area must be a valid number")
    .custom((value) => {
      if (Number(value) <= 0) {
        throw new Error("Floor area must be greater than 0");
      }
      return true;
    }),

  body("totalContractPrice")
    .notEmpty()
    .withMessage("Total contract price is required")
    .isDecimal()
    .withMessage("Total contract price must be a valid number")
    .custom((value) => {
      if (Number(value) <= 0) {
        throw new Error("Total contract price must be greater than 0");
      }
      return true;
    }),

  body("downpayment")
    .notEmpty()
    .withMessage("Downpayment is required")
    .isDecimal()
    .withMessage("Downpayment must be a valid number")
    .custom((value) => {
      if (Number(value) < 0) {
        throw new Error("Downpayment cannot be negative");
      }
      return true;
    }),

  body("balance")
    .notEmpty()
    .withMessage("Balance is required")
    .isDecimal()
    .withMessage("Balance must be a valid number")
    .custom((value) => {
      if (Number(value) < 0) {
        throw new Error("Balance cannot be negative");
      }
      return true;
    }),

  body("annualInterestRate")
    .optional()
    .isDecimal()
    .withMessage("Annual interest rate must be a valid number")
    .custom((value) => {
      if (Number(value) < 0) {
        throw new Error("Annual interest rate cannot be negative");
      }

      if (Number(value) > 100) {
        throw new Error("Annual interest rate cannot exceed 100%");
      }

      return true;
    }),

  body("monthlyAmortization10Years")
    .optional()
    .isDecimal()
    .withMessage("10-year monthly amortization must be a valid number")
    .custom((value) => {
      if (Number(value) < 0) {
        throw new Error("10-year monthly amortization cannot be negative");
      }
      return true;
    }),

  body("monthlyAmortization15Years")
    .optional()
    .isDecimal()
    .withMessage("15-year monthly amortization must be a valid number")
    .custom((value) => {
      if (Number(value) < 0) {
        throw new Error("15-year monthly amortization cannot be negative");
      }
      return true;
    }),

  body("monthlyAmortization20Years")
    .optional()
    .isDecimal()
    .withMessage("20-year monthly amortization must be a valid number")
    .custom((value) => {
      if (Number(value) < 0) {
        throw new Error("20-year monthly amortization cannot be negative");
      }
      return true;
    }),

  body("monthlyAmortization25Years")
    .optional()
    .isDecimal()
    .withMessage("25-year monthly amortization must be a valid number")
    .custom((value) => {
      if (Number(value) < 0) {
        throw new Error("25-year monthly amortization cannot be negative");
      }
      return true;
    }),
];

const updateLotQuotationValidation = [
  param("id").isUUID().withMessage("Lot quotation ID must be a valid UUID"),

  body("lotId").optional().isUUID().withMessage("Lot ID must be a valid UUID"),

  body("floorAreaSqm")
    .optional()
    .isDecimal()
    .withMessage("Floor area must be a valid number")
    .custom((value) => {
      if (Number(value) <= 0) {
        throw new Error("Floor area must be greater than 0");
      }
      return true;
    }),

  body("totalContractPrice")
    .optional()
    .isDecimal()
    .withMessage("Total contract price must be a valid number")
    .custom((value) => {
      if (Number(value) <= 0) {
        throw new Error("Total contract price must be greater than 0");
      }
      return true;
    }),

  body("downpayment")
    .optional()
    .isDecimal()
    .withMessage("Downpayment must be a valid number")
    .custom((value) => {
      if (Number(value) < 0) {
        throw new Error("Downpayment cannot be negative");
      }
      return true;
    }),

  body("balance")
    .optional()
    .isDecimal()
    .withMessage("Balance must be a valid number")
    .custom((value) => {
      if (Number(value) < 0) {
        throw new Error("Balance cannot be negative");
      }
      return true;
    }),

  body("annualInterestRate")
    .optional()
    .isDecimal()
    .withMessage("Annual interest rate must be a valid number")
    .custom((value) => {
      if (Number(value) < 0) {
        throw new Error("Annual interest rate cannot be negative");
      }

      if (Number(value) > 100) {
        throw new Error("Annual interest rate cannot exceed 100%");
      }

      return true;
    }),

  body("monthlyAmortization10Years")
    .optional()
    .isDecimal()
    .withMessage("10-year monthly amortization must be a valid number"),

  body("monthlyAmortization15Years")
    .optional()
    .isDecimal()
    .withMessage("15-year monthly amortization must be a valid number"),

  body("monthlyAmortization20Years")
    .optional()
    .isDecimal()
    .withMessage("20-year monthly amortization must be a valid number"),

  body("monthlyAmortization25Years")
    .optional()
    .isDecimal()
    .withMessage("25-year monthly amortization must be a valid number"),
];

const getLotQuotationValidation = [
  param("id").isUUID().withMessage("Lot quotation ID must be a valid UUID"),
];

const deleteLotQuotationValidation = [
  param("id").isUUID().withMessage("Lot quotation ID must be a valid UUID"),
];

export {
  createLotQuotationValidation,
  updateLotQuotationValidation,
  getLotQuotationValidation,
  deleteLotQuotationValidation,
};
