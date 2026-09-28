-- CreateEnum
CREATE TYPE "CivilStatus" AS ENUM ('SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED', 'SEPARATED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthdate" TIMESTAMP(3),
ADD COLUMN     "city" TEXT,
ADD COLUMN     "civilStatus" "CivilStatus",
ADD COLUMN     "country" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "middleName" TEXT,
ADD COLUMN     "otherContact" TEXT,
ADD COLUMN     "placeOfBirth" TEXT,
ADD COLUMN     "spouseName" TEXT,
ADD COLUMN     "taxIdentificationNumber" TEXT;
