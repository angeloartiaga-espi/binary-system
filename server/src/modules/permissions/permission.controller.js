import { validationResult } from "express-validator";

import * as permissionService from "./permission.service.js";

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
    const permissions = await permissionService.listPermissions();

    res.json({
      success: true,
      data: permissions,
    });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const permission = await permissionService.getPermissionById(req.params.id);

    res.json({
      success: true,
      data: permission,
    });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;

    const permission = await permissionService.createPermission(req.body);

    res.status(201).json({
      success: true,
      data: permission,
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;

    const permission = await permissionService.updatePermission(
      req.params.id,
      req.body,
    );

    res.json({
      success: true,
      data: permission,
    });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await permissionService.deletePermission(req.params.id);

    res.json({
      success: true,
      message: "Permission deleted",
    });
  } catch (err) {
    next(err);
  }
}

async function assignableRoles(req, res, next) {
  try {
    const roles = await permissionService.listAssignableRoles();

    res.json({
      success: true,
      data: roles,
    });
  } catch (err) {
    next(err);
  }
}

async function assign(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;

    const result = await permissionService.assignPermissionsToRole(
      req.body.roleId,
      req.body.permissionIds,
    );

    res.json({
      success: true,
      message: "Permissions updated",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export { list, getOne, create, update, remove, assignableRoles, assign };
