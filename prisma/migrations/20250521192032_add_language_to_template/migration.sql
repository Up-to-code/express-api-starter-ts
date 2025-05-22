/*
  Warnings:

  - A unique constraint covering the columns `[name,language]` on the table `Template` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en';

-- CreateIndex
CREATE UNIQUE INDEX "Template_name_language_key" ON "Template"("name", "language");
