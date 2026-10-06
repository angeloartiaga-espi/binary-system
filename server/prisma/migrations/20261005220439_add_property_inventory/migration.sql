-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "LotStatus" AS ENUM ('OPEN', 'SOLD', 'RE_OPEN', 'HOLD', 'RESERVED');

-- CreateTable
CREATE TABLE "ProjectLocation" (
    "id" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "totalLotAreaSqm" DECIMAL(12,2) NOT NULL,
    "roadAreaSqm" DECIMAL(12,2),
    "availableLotAreaSqm" DECIMAL(12,2),
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lot" (
    "id" UUID NOT NULL,
    "projectLocationId" TEXT NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "lotAreaSqm" DECIMAL(10,2) NOT NULL,
    "status" "LotStatus" NOT NULL DEFAULT 'OPEN',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LotQuotation" (
    "id" UUID NOT NULL,
    "lotId" UUID NOT NULL,
    "floorAreaSqm" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(15,2) NOT NULL,
    "contractPrice" DECIMAL(15,2) NOT NULL,
    "downpayment" DECIMAL(15,2) NOT NULL,
    "balance" DECIMAL(15,2) NOT NULL,
    "annualInterestRate" DECIMAL(5,2) NOT NULL DEFAULT 6.5,
    "monthlyAmortization10Years" DECIMAL(15,2),
    "monthlyAmortization15Years" DECIMAL(15,2),
    "monthlyAmortization20Years" DECIMAL(15,2),
    "monthlyAmortization25Years" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LotQuotation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectLocation_projectName_idx" ON "ProjectLocation"("projectName");

-- CreateIndex
CREATE INDEX "ProjectLocation_location_idx" ON "ProjectLocation"("location");

-- CreateIndex
CREATE INDEX "ProjectLocation_status_idx" ON "ProjectLocation"("status");

-- CreateIndex
CREATE INDEX "Lot_projectLocationId_idx" ON "Lot"("projectLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "Lot_projectLocationId_lotNumber_key" ON "Lot"("projectLocationId", "lotNumber");

-- CreateIndex
CREATE INDEX "LotQuotation_lotId_idx" ON "LotQuotation"("lotId");

-- AddForeignKey
ALTER TABLE "Lot" ADD CONSTRAINT "Lot_projectLocationId_fkey" FOREIGN KEY ("projectLocationId") REFERENCES "ProjectLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotQuotation" ADD CONSTRAINT "LotQuotation_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
