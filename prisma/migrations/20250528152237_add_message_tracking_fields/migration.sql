/*
  Warnings:

  - Added the required column `updatedAt` to the `QAPair` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "errorDetails" TEXT,
ADD COLUMN     "failedAt" TIMESTAMP(3),
ADD COLUMN     "isAutomated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastStatusUpdate" TIMESTAMP(3),
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "responseSource" TEXT,
ADD COLUMN     "sentAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT,
ADD COLUMN     "whatsappMessageId" TEXT;

-- AlterTable
ALTER TABLE "QAPair" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "category" SET DEFAULT 'general';

-- CreateIndex
CREATE INDEX "Message_whatsappMessageId_idx" ON "Message"("whatsappMessageId");

-- CreateIndex
CREATE INDEX "Message_status_idx" ON "Message"("status");

-- CreateIndex
CREATE INDEX "Message_isBot_idx" ON "Message"("isBot");

-- CreateIndex
CREATE INDEX "Message_sentAt_idx" ON "Message"("sentAt");

-- CreateIndex
CREATE INDEX "QAPair_category_idx" ON "QAPair"("category");

-- CreateIndex
CREATE INDEX "QAPair_language_idx" ON "QAPair"("language");

-- CreateIndex
CREATE INDEX "QAPair_isActive_idx" ON "QAPair"("isActive");
