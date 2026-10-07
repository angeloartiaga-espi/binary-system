import { validationResult } from "express-validator";
import * as lotService from "./lot.service.js";

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
    const { projectLocationId, page, limit, search, status } = req.query;
    const result = await lotService.listLots({
      projectLocationId,
      page: page || 1,
      limit: limit || 10,
      search,
      status,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const lot = await lotService.getLotById(req.params.id);
    res.json({ success: true, data: lot });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;
    const lot = await lotService.createLot(req.body);
    res.status(201).json({ success: true, data: lot });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;
    const lot = await lotService.updateLot(req.params.id, req.body);
    res.json({ success: true, data: lot });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await lotService.deleteLot(req.params.id);
    res.json({ success: true, message: "Lot deleted" });
  } catch (err) {
    next(err);
  }
}

export { list, getOne, create, update, remove };
