import prisma from "../../config/db.js";
import { summarizeLotCounts, emptyCounts } from "./lotCounts.js";

// Prisma returns Decimal fields as Decimal.js instances — convert them so
// the frontend always receives plain numbers.
function toNumber(value) {
  return value === null || value === undefined ? value : Number(value);
}

// `counts` = { cuts, incRoad, availableCuts }, computed from the project's
// lots (see lotCounts.js). These are never stored on the project row.
function shapeProjectLocation(project, counts = emptyCounts()) {
  return {
    id: project.id,
    projectName: project.projectName,
    location: project.location,
    totalLotAreaSqm: toNumber(project.totalLotAreaSqm),
    description: project.description,
    status: project.status,
    cuts: counts.cuts,
    incRoad: counts.incRoad,
    availableCuts: counts.availableCuts,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

// One query for ALL projects on the page (not one per project).
async function countsForProjects(projectIds) {
  if (projectIds.length === 0) return new Map();

  const rows = await prisma.lot.groupBy({
    by: ["projectLocationId", "status"],
    where: { projectLocationId: { in: projectIds } },
    _count: { _all: true },
  });

  return summarizeLotCounts(rows);
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
    }),
    prisma.projectLocation.count({ where }),
  ]);

  const countsById = await countsForProjects(items.map((p) => p.id));

  return {
    items: items.map((p) => shapeProjectLocation(p, countsById.get(p.id))),
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit) || 1,
  };
}

async function getProjectLocationById(id) {
  const project = await prisma.projectLocation.findUnique({ where: { id } });

  if (!project) {
    const err = new Error("Project location not found");
    err.status = 404;
    throw err;
  }

  const countsById = await countsForProjects([id]);
  return shapeProjectLocation(project, countsById.get(id));
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

  await prisma.projectLocation.update({
    where: { id },
    data: {
      projectName: data.projectName ?? existingProject.projectName,
      location: data.location ?? existingProject.location,
      totalLotAreaSqm: data.totalLotAreaSqm ?? existingProject.totalLotAreaSqm,
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
// LotQuotation -> Lot), so deleting a project also deletes its lots and
// their quotations. The list page warns with the cut count first.
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
  toNumber,
  listProjectLocations,
  getProjectLocationById,
  createProjectLocation,
  updateProjectLocation,
  deleteProjectLocation,
};
