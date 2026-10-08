/*
  Warnings:

  - Added the required column `jobId` to the `Model` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sandboxId` to the `Model` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "jobId" TEXT NOT NULL,
ADD COLUMN     "sandboxId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Modelresults" (
    "id" TEXT NOT NULL,
    "geminiResult" TEXT NOT NULL,
    "llammma" TEXT NOT NULL,
    "info" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "answers" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Modelresults_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Modelresults_modelId_key" ON "Modelresults"("modelId");

-- AddForeignKey
ALTER TABLE "Modelresults" ADD CONSTRAINT "Modelresults_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modelresults" ADD CONSTRAINT "Modelresults_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
