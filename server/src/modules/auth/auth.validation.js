import { body } from "express-validator";

const registerValidation = [
  // ==========================================
  // BASIC INFORMATION
  // ==========================================

  body("firstName").trim().notEmpty().withMessage("First name is required"),

  body("middleName")
    .optional({ checkFalsy: true })
    .trim()
    .isString()
    .withMessage("Middle name must be a valid text"),

  body("lastName").trim().notEmpty().withMessage("Last name is required"),

  // ==========================================
  // ACCOUNT INFORMATION
  // ==========================================

  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }

    return true;
  }),

  // ==========================================
  // CONTACT INFORMATION
  // ==========================================

  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .isString()
    .withMessage("Contact number must be a valid text"),

  body("otherContact")
    .optional({ checkFalsy: true })
    .trim()
    .isString()
    .withMessage("Other contact number must be a valid text"),

  // ==========================================
  // ADDRESS
  // ==========================================

  body("city")
    .optional({ checkFalsy: true })
    .trim()
    .isString()
    .withMessage("City must be a valid text"),

  body("country")
    .optional({ checkFalsy: true })
    .trim()
    .isString()
    .withMessage("Country must be a valid text"),

  // ==========================================
  // PERSONAL INFORMATION
  // ==========================================

  body("birthdate")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Birthdate must be a valid date"),

  body("placeOfBirth")
    .optional({ checkFalsy: true })
    .trim()
    .isString()
    .withMessage("Place of birth must be a valid text"),

  body("civilStatus")
    .optional({ checkFalsy: true })
    .isIn(["SINGLE", "MARRIED", "WIDOWED", "DIVORCED", "SEPARATED"])
    .withMessage("Invalid civil status"),

  body("gender")
    .optional({ checkFalsy: true })
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("Invalid gender"),

  // ==========================================
  // TAX INFORMATION
  // ==========================================

  body("taxIdentificationNumber")
    .optional({ checkFalsy: true })
    .trim()
    .isString()
    .withMessage("Tax identification number must be a valid text"),

  // ==========================================
  // SPOUSE INFORMATION
  // ==========================================

  body("spouseName")
    .optional({ checkFalsy: true })
    .trim()
    .isString()
    .withMessage("Spouse name must be a valid text"),

  // ==========================================
  // REFERRAL
  // ==========================================

  body("referrerCode")
    .optional({ checkFalsy: true })
    .trim()
    .isString()
    .withMessage("Referrer code must be a valid text"),

  // ==========================================
  // PRIVACY CONSENT
  // ==========================================

  // Sent as a string "true" because this comes from multipart/form-data
  body("privacyConsent")
    .custom((value) => value === "true" || value === true)
    .withMessage("You must accept the Privacy Notice to continue"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

export { registerValidation, loginValidation };
