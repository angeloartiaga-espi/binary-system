import express from "express";

import {
  list,
  getOne,
  create,
  update,
  remove,
} from "./lotQuotation.controller.js";

import {
  createLotQuotationValidation,
  updateLotQuotationValidation,
  getLotQuotationValidation,
  deleteLotQuotationValidation,
} from "./lotQuotation.validation.js";

const router = express.Router();

// GET /api/lot-quotations
router.get("/", list);

// GET /api/lot-quotations/:id
router.get("/:id", getLotQuotationValidation, getOne);

// POST /api/lot-quotations
router.post("/", createLotQuotationValidation, create);

// PUT /api/lot-quotations/:id
router.put("/:id", updateLotQuotationValidation, update);

// DELETE /api/lot-quotations/:id
router.delete("/:id", deleteLotQuotationValidation, remove);

export default router;
