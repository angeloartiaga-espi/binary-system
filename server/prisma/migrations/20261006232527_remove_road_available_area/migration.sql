/*
  Warnings:

  - You are about to drop the column `availableLotAreaSqm` on the `ProjectLocation` table. All the data in the column will be lost.
  - You are about to drop the column `roadAreaSqm` on the `ProjectLocation` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "LotStatus" ADD VALUE 'RFO';

-- AlterTable
ALTER TABLE "ProjectLocation" DROP COLUMN "availableLotAreaSqm",
DROP COLUMN "roadAreaSqm";
