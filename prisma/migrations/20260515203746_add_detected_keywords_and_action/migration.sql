-- AlterTable
ALTER TABLE "enrichment" ADD COLUMN     "ai_detected_keywords" JSONB DEFAULT '[]',
ADD COLUMN     "ai_requested_action" TEXT;
