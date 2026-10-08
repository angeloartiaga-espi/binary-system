import prisma from "../../config/db.js";

/**
 * Create lot quotation
 */
async function createLotQuotation(data) {
  const {
    lotId,
    floorAreaSqm,
    totalContractPrice,
    downpayment,
    balance,
    annualInterestRate,
    monthlyAmortization10Years,
    monthlyAmortization15Years,
    monthlyAmortization20Years,
    monthlyAmortization25Years,
  } = data;

  const lot = await prisma.lot.findUnique({
    where: { id: lotId },
  });

  if (!lot) {
    const error = new Error("Lot not found");
    error.statusCode = 404;
    throw error;
  }

  const quotation = await prisma.lotQuotation.create({
    data: {
      lotId,
      floorAreaSqm,
      totalContractPrice,
      downpayment,
      balance,

      annualInterestRate:
        annualInterestRate !== undefined ? annualInterestRate : 6.5,

      monthlyAmortization10Years,
      monthlyAmortization15Years,
      monthlyAmortization20Years,
      monthlyAmortization25Years,
    },

    include: {
      lot: true,
    },
  });

  return quotation;
}

/**
 * Get lot quotation by ID
 */
async function getLotQuotationById(id) {
  const quotation = await prisma.lotQuotation.findUnique({
    where: {
      id,
    },

    include: {
      lot: true,
    },
  });

  if (!quotation) {
    const error = new Error("Lot quotation not found");
    error.statusCode = 404;
    throw error;
  }

  return quotation;
}

/**
 * List lot quotations
 */
async function listLotQuotations({ page = 1, limit = 10, search, lotId }) {
  const currentPage = Number(page);
  const pageSize = Number(limit);

  const skip = (currentPage - 1) * pageSize;

  const where = {};

  if (lotId) {
    where.lotId = lotId;
  }

  if (search) {
    where.lot = {
      OR: [
        {
          lotNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    };
  }

  const [quotations, total] = await Promise.all([
    prisma.lotQuotation.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        lot: true,
      },
    }),

    prisma.lotQuotation.count({
      where,
    }),
  ]);

  return {
    items: quotations,
    pagination: {
      page: currentPage,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

/**
 * Update lot quotation
 */
async function updateLotQuotation(id, data) {
  const existingQuotation = await prisma.lotQuotation.findUnique({
    where: { id },
  });

  if (!existingQuotation) {
    const error = new Error("Lot quotation not found");

    error.statusCode = 404;
    throw error;
  }

  const quotation = await prisma.lotQuotation.update({
    where: { id },
    data,
    include: {
      lot: true,
    },
  });

  return quotation;
}

/**
 * Delete lot quotation
 */
async function deleteLotQuotation(id) {
  const existingQuotation = await prisma.lotQuotation.findUnique({
    where: {
      id,
    },
  });

  if (!existingQuotation) {
    const error = new Error("Lot quotation not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.lotQuotation.delete({
    where: {
      id,
    },
  });

  return true;
}

export {
  createLotQuotation,
  getLotQuotationById,
  listLotQuotations,
  updateLotQuotation,
  deleteLotQuotation,
};
