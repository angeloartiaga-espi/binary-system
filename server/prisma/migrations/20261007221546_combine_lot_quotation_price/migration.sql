/*
  Warnings:

  - You are about to drop the column `contractPrice` on the `LotQuotation` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `LotQuotation` table. All the data in the column will be lost.
  - Added the required column `totalContractPrice` to the `LotQuotation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LotQuotation" DROP COLUMN "contractPrice",
DROP COLUMN "totalPrice",
ADD COLUMN     "totalContractPrice" DECIMAL(15,2) NOT NULL;
