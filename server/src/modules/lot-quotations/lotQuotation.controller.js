import { validationResult } from "express-validator";

import * as lotQuotationService from "./lotQuotation.service.js";

function checkValidation(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });

    return false;
  }

  return true;
}

async function list(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;

    const { page, limit, search, lotId } = req.query;

    const result = await lotQuotationService.listLotQuotations({
      page: page || 1,
      limit: limit || 10,
      search,
      lotId,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;

    const quotation = await lotQuotationService.getLotQuotationById(
      req.params.id,
    );

    res.json({
      success: true,
      data: quotation,
    });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;

    const quotation = await lotQuotationService.createLotQuotation(req.body);

    res.status(201).json({
      success: true,
      data: quotation,
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;

    const quotation = await lotQuotationService.updateLotQuotation(
      req.params.id,
      req.body,
    );

    res.json({
      success: true,
      data: quotation,
    });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;

    await lotQuotationService.deleteLotQuotation(req.params.id);

    res.json({
      success: true,
      message: "Lot quotation deleted",
    });
  } catch (err) {
    next(err);
  }
}

export { list, getOne, create, update, remove };
