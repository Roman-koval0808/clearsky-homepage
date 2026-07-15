-- Section 6 Outcome migration
-- Replaces legacy outcomes table with execution-linked outcome records.

DROP TABLE IF EXISTS "outcomes" CASCADE;

CREATE TABLE "outcomes" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "outcome_id" TEXT UNIQUE NOT NULL,
    "event_id" TEXT NOT NULL,
    "decision_id" TEXT NOT NULL,
    "action_queue_id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "action_id" TEXT NOT NULL,
    "outcome_type" TEXT NOT NULL,
    "outcome_status" TEXT NOT NULL,
    "time_to_response_hours" DOUBLE PRECISION,
    "approval_wait_hours" DOUBLE PRECISION,
    "human_edited" BOOLEAN NOT NULL DEFAULT FALSE,
    "posted_externally" BOOLEAN NOT NULL DEFAULT FALSE,
    "do_not_count_as_success" BOOLEAN NOT NULL DEFAULT FALSE,
    "details" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_outcomes_event_id" ON "outcomes"("event_id");
CREATE INDEX "idx_outcomes_decision_id" ON "outcomes"("decision_id");
CREATE INDEX "idx_outcomes_execution_id" ON "outcomes"("execution_id");
CREATE INDEX "idx_outcomes_outcome_status" ON "outcomes"("outcome_status");
CREATE INDEX "idx_outcomes_outcome_type" ON "outcomes"("outcome_type");
CREATE INDEX "idx_outcomes_posted_externally" ON "outcomes"("posted_externally");

CREATE TABLE IF NOT EXISTS "blocked_outcome_context" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "blocked_context_id" TEXT UNIQUE NOT NULL,
    "event_id" TEXT NOT NULL,
    "decision_id" TEXT NOT NULL,
    "action_id" TEXT NOT NULL,
    "action_name" TEXT,
    "blocked_reason" TEXT,
    "outcome_type" TEXT NOT NULL DEFAULT 'blocked_preserved',
    "outcome_status" TEXT NOT NULL DEFAULT 'blocked',
    "posted_to_google" BOOLEAN NOT NULL DEFAULT FALSE,
    "external_action_completed" BOOLEAN NOT NULL DEFAULT FALSE,
    "do_not_count_as_success" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_blocked_ctx_event_id" ON "blocked_outcome_context"("event_id");
CREATE INDEX IF NOT EXISTS "idx_blocked_ctx_decision_id" ON "blocked_outcome_context"("decision_id");
CREATE INDEX IF NOT EXISTS "idx_blocked_ctx_action_id" ON "blocked_outcome_context"("action_id");

ALTER TABLE "action_executions"
    ADD COLUMN IF NOT EXISTS "outcome_id" TEXT;

CREATE INDEX IF NOT EXISTS "idx_action_executions_outcome_id"
    ON "action_executions"("outcome_id");
