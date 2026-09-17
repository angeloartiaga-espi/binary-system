import { validationResult } from "express-validator";

import {
  listRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignRoleToUser,
  listAssignableUsers,
} from "./role.service.js";

async function list(req, res, next) {
  try {
    const roles = await listRoles();

    res.json({
      success: true,
      data: roles,
    });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const role = await getRoleById(req.params.id);

    res.json({
      success: true,
      data: role,
    });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const role = await createRole(req.body);

    res.status(201).json({
      success: true,
      data: role,
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const role = await updateRole(req.params.id, req.body);

    res.json({
      success: true,
      data: role,
    });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await deleteRole(req.params.id);

    res.json({
      success: true,
      message: "Role deleted",
    });
  } catch (err) {
    next(err);
  }
}

async function assign(req, res, next) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const result = await assignRoleToUser(req.body.userId, req.body.role);

    res.json({
      success: true,
      message: "Role assigned",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function assignableUsers(req, res, next) {
  try {
    const users = await listAssignableUsers();

    res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    next(err);
  }
}

export { list, getOne, create, update, remove, assign, assignableUsers };
