import { validationResult } from "express-validator";
import * as projectLocationService from "./projectLocation.service.js";

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
    const { page, limit, search, status } = req.query;
    const result = await projectLocationService.listProjectLocations({
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
    const project = await projectLocationService.getProjectLocationById(
      req.params.id,
    );
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;
    const project = await projectLocationService.createProjectLocation(
      req.body,
    );
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;
    const project = await projectLocationService.updateProjectLocation(
      req.params.id,
      req.body,
    );
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await projectLocationService.deleteProjectLocation(req.params.id);
    res.json({ success: true, message: "Project location deleted" });
  } catch (err) {
    next(err);
  }
}

export { list, getOne, create, update, remove };
