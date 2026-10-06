import prisma from "../../config/db.js";

// Prisma returns Decimal fields as Decimal.js instances, which don't
// serialize to JSON the way a plain number does — convert explicitly so
// the frontend always receives real numbers, not decimal objects/strings.
function toNumber(value) {
  return value === null || value === undefined ? value : Number(value);
}

function shapeProjectLocation(project) {
  return {
    id: project.id,
    projectName: project.projectName,
    location: project.location,
    totalLotAreaSqm: toNumber(project.totalLotAreaSqm),
    roadAreaSqm: toNumber(project.roadAreaSqm),
    availableLotAreaSqm: toNumber(project.availableLotAreaSqm),
    description: project.description,
    status: project.status,
    lotCount: project._count?.lots ?? undefined,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

// If availableLotAreaSqm wasn't explicitly provided, derive it from
// total - road so the three numbers always stay consistent by default.
function deriveAvailableArea({
  totalLotAreaSqm,
  roadAreaSqm,
  availableLotAreaSqm,
}) {
  if (availableLotAreaSqm !== undefined && availableLotAreaSqm !== null) {
    return availableLotAreaSqm;
  }
  const road = roadAreaSqm ?? 0;
  return totalLotAreaSqm - road;
}

async function listProjectLocations({
  page = 1,
  limit = 10,
  search = "",
  status,
}) {
  const skip = (page - 1) * limit;

  const where = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { projectName: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.projectLocation.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { lots: true } } },
    }),
    prisma.projectLocation.count({ where }),
  ]);

  return {
    items: items.map(shapeProjectLocation),
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit) || 1,
  };
}

async function getProjectLocationById(id) {
  const project = await prisma.projectLocation.findUnique({
    where: { id },
    include: { _count: { select: { lots: true } } },
  });

  if (!project) {
    const err = new Error("Project location not found");
    err.status = 404;
    throw err;
  }

  return shapeProjectLocation(project);
}

async function createProjectLocation(data) {
  const existing = await prisma.projectLocation.findFirst({
    where: { projectName: data.projectName, location: data.location },
  });
  if (existing) {
    const err = new Error(
      "A project with this name already exists at this location",
    );
    err.status = 409;
    throw err;
  }

  const created = await prisma.projectLocation.create({
    data: {
      projectName: data.projectName,
      location: data.location,
      totalLotAreaSqm: data.totalLotAreaSqm,
      roadAreaSqm: data.roadAreaSqm ?? null,
      availableLotAreaSqm: deriveAvailableArea(data),
      description: data.description || null,
      status: data.status || "ACTIVE",
    },
  });

  return getProjectLocationById(created.id);
}

async function updateProjectLocation(id, data) {
  const existingProject = await prisma.projectLocation.findUnique({
    where: { id },
  });
  if (!existingProject) {
    const err = new Error("Project location not found");
    err.status = 404;
    throw err;
  }

  const totalLotAreaSqm =
    data.totalLotAreaSqm ?? Number(existingProject.totalLotAreaSqm);
  const roadAreaSqm =
    data.roadAreaSqm !== undefined
      ? data.roadAreaSqm
      : toNumber(existingProject.roadAreaSqm);

  // Only auto-recompute availableLotAreaSqm when the caller didn't send an
  // explicit value AND one of the inputs it depends on actually changed —
  // otherwise an edit that only touches, say, the description would
  // silently overwrite a manually-set available area.
  const availableLotAreaSqm =
    data.availableLotAreaSqm !== undefined
      ? data.availableLotAreaSqm
      : data.totalLotAreaSqm !== undefined || data.roadAreaSqm !== undefined
        ? totalLotAreaSqm - (roadAreaSqm ?? 0)
        : toNumber(existingProject.availableLotAreaSqm);

  await prisma.projectLocation.update({
    where: { id },
    data: {
      projectName: data.projectName ?? existingProject.projectName,
      location: data.location ?? existingProject.location,
      totalLotAreaSqm,
      roadAreaSqm,
      availableLotAreaSqm,
      description:
        data.description !== undefined
          ? data.description || null
          : existingProject.description,
      status: data.status ?? existingProject.status,
    },
  });

  return getProjectLocationById(id);
}

// The schema defines onDelete: Cascade from Lot -> ProjectLocation (and
// LotQuotation -> Lot), so this intentionally cascades: deleting a project
// also deletes its lots and their quotations. The frontend warns the user
// with the current lot count before calling this, via getProjectLocationById.
async function deleteProjectLocation(id) {
  const existingProject = await prisma.projectLocation.findUnique({
    where: { id },
  });
  if (!existingProject) {
    const err = new Error("Project location not found");
    err.status = 404;
    throw err;
  }

  await prisma.projectLocation.delete({ where: { id } });
}

export {
  listProjectLocations,
  getProjectLocationById,
  createProjectLocation,
  updateProjectLocation,
  deleteProjectLocation,
};
