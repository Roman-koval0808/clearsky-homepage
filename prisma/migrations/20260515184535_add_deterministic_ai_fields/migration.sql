-- AlterTable
ALTER TABLE "enrichment" ADD COLUMN     "ai_contains_callback_request" BOOLEAN DEFAULT false,
ADD COLUMN     "ai_contains_emergency_keywords" BOOLEAN DEFAULT false,
ADD COLUMN     "ai_contains_problem" BOOLEAN DEFAULT false,
ADD COLUMN     "ai_contains_quote_request" BOOLEAN DEFAULT false,
ADD COLUMN     "ai_requested_contact_method" TEXT;
