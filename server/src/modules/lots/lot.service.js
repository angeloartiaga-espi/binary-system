import prisma from "../../config/db.js";

function toNumber(value) {
  return value === null || value === undefined ? value : Number(value);
}

function shapeLot(lot) {
  return {
    id: lot.id,
    projectLocationId: lot.projectLocationId,
    lotNumber: lot.lotNumber,
    lotAreaSqm: toNumber(lot.lotAreaSqm),
    status: lot.status,
    remarks: lot.remarks,
    quotationCount: lot._count?.quotations ?? undefined,
    createdAt: lot.createdAt,
    updatedAt: lot.updatedAt,
  };
}

async function assertProjectExists(projectLocationId) {
  const project = await prisma.projectLocation.findUnique({
    where: { id: projectLocationId },
  });
  if (!project) {
    const err = new Error("Project location not found");
    err.status = 404;
    throw err;
  }
  return project;
}

async function listLots({
  projectLocationId,
  page = 1,
  limit = 10,
  search = "",
  status,
}) {
  await assertProjectExists(projectLocationId);

  const skip = (page - 1) * limit;

  const where = {
    projectLocationId,
    ...(status ? { status } : {}),
    ...(search ? { lotNumber: { contains: search, mode: "insensitive" } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.lot.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { lotNumber: "asc" },
      include: { _count: { select: { quotations: true } } },
    }),
    prisma.lot.count({ where }),
  ]);

  return {
    items: items.map(shapeLot),
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit) || 1,
  };
}

async function getLotById(id) {
  const lot = await prisma.lot.findUnique({
    where: { id },
    include: { _count: { select: { quotations: true } } },
  });

  if (!lot) {
    const err = new Error("Lot not found");
    err.status = 404;
    throw err;
  }

  return shapeLot(lot);
}

async function createLot(data) {
  await assertProjectExists(data.projectLocationId);

  // Mirrors the schema's @@unique([projectLocationId, lotNumber]) with a
  // friendly message instead of a raw Prisma P2002 constraint error.
  const existing = await prisma.lot.findUnique({
    where: {
      projectLocationId_lotNumber: {
        projectLocationId: data.projectLocationId,
        lotNumber: data.lotNumber,
      },
    },
  });
  if (existing) {
    const err = new Error(
      `Lot "${data.lotNumber}" already exists in this project`,
    );
    err.status = 409;
    throw err;
  }

  const created = await prisma.lot.create({
    data: {
      projectLocationId: data.projectLocationId,
      lotNumber: data.lotNumber,
      lotAreaSqm: data.lotAreaSqm,
      status: data.status || "OPEN",
      remarks: data.remarks || null,
    },
  });

  return getLotById(created.id);
}

async function updateLot(id, data) {
  const existingLot = await prisma.lot.findUnique({ where: { id } });
  if (!existingLot) {
    const err = new Error("Lot not found");
    err.status = 404;
    throw err;
  }

  if (data.lotNumber && data.lotNumber !== existingLot.lotNumber) {
    const duplicate = await prisma.lot.findUnique({
      where: {
        projectLocationId_lotNumber: {
          projectLocationId: existingLot.projectLocationId,
          lotNumber: data.lotNumber,
        },
      },
    });
    if (duplicate) {
      const err = new Error(
        `Lot "${data.lotNumber}" already exists in this project`,
      );
      err.status = 409;
      throw err;
    }
  }

  await prisma.lot.update({
    where: { id },
    data: {
      lotNumber: data.lotNumber ?? existingLot.lotNumber,
      lotAreaSqm: data.lotAreaSqm ?? existingLot.lotAreaSqm,
      status: data.status ?? existingLot.status,
      remarks:
        data.remarks !== undefined ? data.remarks || null : existingLot.remarks,
    },
  });

  return getLotById(id);
}

// Schema defines onDelete: Cascade from LotQuotation -> Lot, so deleting a
// lot takes its quotations with it. Mirrors the same cascade decision made
// for ProjectLocation -> Lot.
async function deleteLot(id) {
  const existingLot = await prisma.lot.findUnique({
    where: { id },
    include: { _count: { select: { quotations: true } } },
  });
  if (!existingLot) {
    const err = new Error("Lot not found");
    err.status = 404;
    throw err;
  }

  await prisma.lot.delete({ where: { id } });
}

export { listLots, getLotById, createLot, updateLot, deleteLot };
