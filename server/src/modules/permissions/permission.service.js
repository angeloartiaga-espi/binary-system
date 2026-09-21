import prisma from "../../config/db.js";

// These permissions are created by the seed script and are used by
// requirePermission() throughout the application.
//
// Renaming or deleting them could break protected routes.
const PROTECTED_PERMISSION_NAMES = [
  "view_dashboard",
  "manage_users",
  "manage_properties",
  "manage_roles",
  "manage_permissions",
];

function shapePermission(permission) {
  return {
    id: permission.id,
    name: permission.name,
    description: permission.description,

    // Read-only here.
    // Permission assignment happens on the Assign Permission screen.
    roles: permission.roles.map((rp) => rp.role),

    isProtected: PROTECTED_PERMISSION_NAMES.includes(permission.name),

    createdAt: permission.createdAt,
    updatedAt: permission.updatedAt,
  };
}

async function listPermissions() {
  const permissions = await prisma.permission.findMany({
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return permissions.map(shapePermission);
}

async function getPermissionById(id) {
  const permission = await prisma.permission.findUnique({
    where: { id },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!permission) {
    const err = new Error("Permission not found");
    err.status = 404;
    throw err;
  }

  return shapePermission(permission);
}

// Permission List scope:
// name + description only.
async function createPermission({ name, description }) {
  const existing = await prisma.permission.findUnique({
    where: { name },
  });

  if (existing) {
    const err = new Error("A permission with this name already exists");
    err.status = 409;
    throw err;
  }

  const created = await prisma.permission.create({
    data: {
      name,
      description,
    },
  });

  return getPermissionById(created.id);
}

async function updatePermission(id, { name, description }) {
  const existingPermission = await prisma.permission.findUnique({
    where: { id },
  });

  if (!existingPermission) {
    const err = new Error("Permission not found");
    err.status = 404;
    throw err;
  }

  // Protected permissions cannot have their names changed.
  if (
    PROTECTED_PERMISSION_NAMES.includes(existingPermission.name) &&
    name &&
    name !== existingPermission.name
  ) {
    const err = new Error(
      `The "${existingPermission.name}" permission's name is used by the system and can't be changed`,
    );
    err.status = 400;
    throw err;
  }

  // If changing to another existing permission name,
  // Prisma's unique constraint will catch it.
  await prisma.permission.update({
    where: { id },
    data: {
      name: name ?? existingPermission.name,
      description: description ?? existingPermission.description,
    },
  });

  return getPermissionById(id);
}

async function deletePermission(id) {
  const existingPermission = await prisma.permission.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          roles: true,
        },
      },
    },
  });

  if (!existingPermission) {
    const err = new Error("Permission not found");
    err.status = 404;
    throw err;
  }

  // Protected permissions cannot be deleted.
  if (PROTECTED_PERMISSION_NAMES.includes(existingPermission.name)) {
    const err = new Error(
      `The "${existingPermission.name}" permission is required by the system and can't be deleted`,
    );
    err.status = 400;
    throw err;
  }

  // Prevent deletion while the permission is assigned.
  if (existingPermission._count.roles > 0) {
    const err = new Error(
      "This permission is still assigned to one or more roles — unassign it first",
    );
    err.status = 409;
    throw err;
  }

  await prisma.permission.delete({
    where: { id },
  });
}

// -----------------------------------------------------------------------------
// Assign Permission screen
// -----------------------------------------------------------------------------

// Returns all roles and the permissions currently assigned to each role.
//
// This endpoint only needs manage_permissions.
// It does not require manage_roles.
async function listAssignableRoles() {
  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        select: {
          permissionId: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return roles.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
    permissionIds: role.permissions.map((rp) => rp.permissionId),
  }));
}

// permissionIds represents the COMPLETE permission set
// the role should have going forward.
//
// Any existing permission not included in permissionIds
// will be removed.
async function assignPermissionsToRole(roleId, permissionIds = []) {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    const err = new Error("Role not found");
    err.status = 404;
    throw err;
  }

  // Make sure all selected permissions actually exist.
  if (permissionIds.length > 0) {
    const found = await prisma.permission.findMany({
      where: {
        id: {
          in: permissionIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (found.length !== permissionIds.length) {
      const err = new Error("One or more selected permissions no longer exist");
      err.status = 400;
      throw err;
    }
  }

  // Replace the role's complete permission set.
  await prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({
      where: {
        roleId,
      },
    });

    if (permissionIds.length > 0) {
      await tx.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      });
    }
  });

  return {
    roleId,
    permissionIds,
  };
}

export {
  listPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  listAssignableRoles,
  assignPermissionsToRole,
};
