/*
  Warnings:

  - You are about to drop the column `answers` on the `Modelresults` table. All the data in the column will be lost.
  - You are about to drop the column `geminiResult` on the `Modelresults` table. All the data in the column will be lost.
  - You are about to drop the column `info` on the `Modelresults` table. All the data in the column will be lost.
  - You are about to drop the column `llammma` on the `Modelresults` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Modelresults` table. All the data in the column will be lost.
  - Added the required column `benchmark` to the `Modelresults` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modelInfo` to the `Modelresults` table without a default value. This is not possible if the table is not empty.
  - Added the required column `performance` to the `Modelresults` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responseTime` to the `Modelresults` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scores` to the `Modelresults` table without a default value. This is not possible if the table is not empty.
  - Added the required column `summary` to the `Modelresults` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Modelresults" DROP COLUMN "answers",
DROP COLUMN "geminiResult",
DROP COLUMN "info",
DROP COLUMN "llammma",
DROP COLUMN "time",
ADD COLUMN     "benchmark" TEXT NOT NULL,
ADD COLUMN     "modelInfo" TEXT NOT NULL,
ADD COLUMN     "performance" TEXT NOT NULL,
ADD COLUMN     "responseTime" TEXT NOT NULL,
ADD COLUMN     "scores" TEXT NOT NULL,
ADD COLUMN     "summary" TEXT NOT NULL;
