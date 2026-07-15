-- DropIndex
DROP INDEX "idx_action_executions_outcome_id";

-- DropIndex
DROP INDEX "idx_blocked_ctx_action_id";

-- DropIndex
DROP INDEX "idx_blocked_ctx_decision_id";

-- DropIndex
DROP INDEX "idx_blocked_ctx_event_id";

-- DropIndex
DROP INDEX "idx_outcomes_decision_id";

-- DropIndex
DROP INDEX "idx_outcomes_event_id";

-- DropIndex
DROP INDEX "idx_outcomes_execution_id";

-- DropIndex
DROP INDEX "idx_outcomes_outcome_status";

-- DropIndex
DROP INDEX "idx_outcomes_outcome_type";

-- DropIndex
DROP INDEX "idx_outcomes_posted_externally";

-- AlterTable
ALTER TABLE "outcomes" ADD COLUMN     "feedback_id" TEXT;

-- CreateTable
CREATE TABLE "feedback_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "feedback_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "decision_id" TEXT NOT NULL,
    "action_queue_id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "outcome_id" TEXT NOT NULL,
    "action_id" TEXT NOT NULL,
    "signal_validity" TEXT,
    "decision_quality" TEXT,
    "action_execution_quality" TEXT,
    "outcome_result" TEXT,
    "human_review_state" TEXT,
    "tuning_candidates" JSONB NOT NULL DEFAULT '[]',
    "production_rules_changed" BOOLEAN NOT NULL DEFAULT false,
    "feedback_rules_snapshot_id" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_context_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "feedback_context_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "decision_id" TEXT NOT NULL,
    "blocked_context_id" TEXT NOT NULL,
    "action_id" TEXT NOT NULL,
    "feedback_context_type" TEXT NOT NULL DEFAULT 'blocked_by_policy',
    "is_execution_failure" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_context_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "feedback_records_feedback_id_key" ON "feedback_records"("feedback_id");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_context_items_feedback_context_id_key" ON "feedback_context_items"("feedback_context_id");

-- AddForeignKey
ALTER TABLE "outcomes" ADD CONSTRAINT "outcomes_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outcomes" ADD CONSTRAINT "outcomes_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "feedback_records"("feedback_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_records" ADD CONSTRAINT "feedback_records_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_context_items" ADD CONSTRAINT "feedback_context_items_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_outcome_context" ADD CONSTRAINT "blocked_outcome_context_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;
