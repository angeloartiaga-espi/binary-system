import prisma from "../../config/db.js";

// Prisma Decimal fields are converted to regular JavaScript numbers
// before being returned to the frontend.
function toNumber(value) {
  return value === null || value === undefined ? value : Number(value);
}

// Shape the project location response for the frontend.
//
// Cuts, Inc. Road:
//   SOLD + HOLD + RESERVED
//
// Available Cuts:
//   OPEN + RE_OPEN + RFO
function shapeProjectLocation(project) {
  const statusCounts = project.lots
    ? project.lots.reduce((counts, lot) => {
        counts[lot.status] = (counts[lot.status] || 0) + 1;
        return counts;
      }, {})
    : {};

  const cutsIncRoad =
    (statusCounts.SOLD || 0) +
    (statusCounts.HOLD || 0) +
    (statusCounts.RESERVED || 0);

  const availableCuts =
    (statusCounts.OPEN || 0) +
    (statusCounts.RE_OPEN || 0) +
    (statusCounts.RFO || 0);

  return {
    id: project.id,
    projectName: project.projectName,
    location: project.location,

    totalLotAreaSqm: toNumber(project.totalLotAreaSqm),

    description: project.description,
    status: project.status,

    // Total number of lots
    lotCount: project._count?.lots ?? project.lots?.length ?? 0,

    // SOLD + HOLD + RESERVED
    cutsIncRoad,

    // OPEN + RE_OPEN + RFO
    availableCuts,

    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
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
            {
              projectName: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              location: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.projectLocation.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: {
        createdAt: "desc",
      },

      include: {
        // We need the individual lot statuses
        // to calculate Cuts, Inc. Road and Available Cuts.
        lots: {
          select: {
            status: true,
          },
        },

        _count: {
          select: {
            lots: true,
          },
        },
      },
    }),

    prisma.projectLocation.count({
      where,
    }),
  ]);

  return {
    items: items.map(shapeProjectLocation),
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)) || 1,
  };
}

async function getProjectLocationById(id) {
  const project = await prisma.projectLocation.findUnique({
    where: {
      id,
    },

    include: {
      // Get lot statuses for the calculated counts
      lots: {
        select: {
          status: true,
        },
      },

      _count: {
        select: {
          lots: true,
        },
      },
    },
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
    where: {
      projectName: data.projectName,
      location: data.location,
    },
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
    where: {
      id,
    },
  });

  if (!existingProject) {
    const err = new Error("Project location not found");
    err.status = 404;
    throw err;
  }

  await prisma.projectLocation.update({
    where: {
      id,
    },

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

// The schema uses onDelete: Cascade from ProjectLocation -> Lot,
// and Lot -> LotQuotation.
//
// Therefore deleting a project location also deletes its lots
// and their quotations.
async function deleteProjectLocation(id) {
  const existingProject = await prisma.projectLocation.findUnique({
    where: {
      id,
    },
  });

  if (!existingProject) {
    const err = new Error("Project location not found");
    err.status = 404;
    throw err;
  }

  await prisma.projectLocation.delete({
    where: {
      id,
    },
  });
}

export {
  listProjectLocations,
  getProjectLocationById,
  createProjectLocation,
  updateProjectLocation,
  deleteProjectLocation,
};
