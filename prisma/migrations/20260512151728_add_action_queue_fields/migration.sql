-- CreateTable
CREATE TABLE "forms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "config" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_submissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "form_id" UUID NOT NULL,
    "event_id" UUID,
    "data" JSONB NOT NULL DEFAULT '{}',
    "submitted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "businesses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "market_id" TEXT,
    "gbp_location_id" TEXT,
    "gbp_account_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_orchestrator_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_id" UUID NOT NULL,
    "automation_level" TEXT NOT NULL DEFAULT 'standard',
    "disabled_signal_ids" JSONB NOT NULL DEFAULT '[]',
    "domain_execution_modes" JSONB NOT NULL DEFAULT '{}',
    "domain_owners" JSONB NOT NULL DEFAULT '{}',
    "preferred_reply_length" TEXT NOT NULL DEFAULT 'medium',
    "include_business_name" BOOLEAN NOT NULL DEFAULT true,
    "include_call_to_action" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_orchestrator_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_configurations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_id" UUID NOT NULL,
    "consultant_id" TEXT,
    "consultant_name" TEXT,
    "consultant_review_required" BOOLEAN NOT NULL DEFAULT true,
    "primary_internal_owner" TEXT NOT NULL DEFAULT 'consultant',
    "approval_route" TEXT NOT NULL DEFAULT 'consultant_then_client',
    "auto_notify_consultant" BOOLEAN NOT NULL DEFAULT true,
    "auto_notify_business_owner" BOOLEAN NOT NULL DEFAULT false,
    "after_hours_escalation_owner" TEXT,
    "review_reply_policy" TEXT NOT NULL DEFAULT 'draft_only',
    "public_response_requires_approval" BOOLEAN NOT NULL DEFAULT true,
    "brand_tone" TEXT NOT NULL DEFAULT 'professional',
    "sla_response_hours" INTEGER NOT NULL DEFAULT 24,
    "office_timezone" TEXT NOT NULL DEFAULT 'UTC',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_compliance_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rule_id" TEXT NOT NULL,
    "rule_name" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "block_reason" TEXT NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_compliance_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orchestrator_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rule_id" TEXT NOT NULL,
    "rule_name" TEXT NOT NULL,
    "signal_rule_id" TEXT NOT NULL,
    "conditions" JSONB,
    "execution_mode" TEXT,
    "owner" TEXT,
    "suppress_signals" JSONB DEFAULT '[]',
    "scope" TEXT NOT NULL DEFAULT 'global',
    "business_id" UUID,
    "is_safety_rule" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orchestrator_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signal_action_mappings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "signal_rule_id" TEXT NOT NULL,
    "action_id" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_secondary" BOOLEAN NOT NULL DEFAULT false,
    "business_id" UUID,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signal_action_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action_library" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "action_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "is_public_facing" BOOLEAN NOT NULL DEFAULT false,
    "default_execution_mode" TEXT NOT NULL DEFAULT 'approval_required',
    "default_owner" TEXT NOT NULL DEFAULT 'system',
    "required_params" JSONB NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orchestrator_decisions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "decision_id" TEXT NOT NULL,
    "event_id" UUID NOT NULL,
    "dominant_signal_id" UUID,
    "supporting_signal_ids" JSONB NOT NULL DEFAULT '[]',
    "selected_action_ids" JSONB NOT NULL DEFAULT '[]',
    "blocked_action_ids" JSONB NOT NULL DEFAULT '[]',
    "execution_mode" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "reason" TEXT,
    "business_config_snapshot" JSONB,
    "safety_checks_passed" BOOLEAN NOT NULL DEFAULT false,
    "consultant_review_required" BOOLEAN NOT NULL DEFAULT true,
    "consultant_id" TEXT,
    "approval_route" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orchestrator_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action_queue" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "queue_trace_id" TEXT,
    "decision_id" UUID NOT NULL,
    "action_id" TEXT NOT NULL,
    "execution_lane" TEXT NOT NULL,
    "parameters" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "due_at" TIMESTAMPTZ(6),
    "consultant_id" TEXT,
    "consultant_review_required" BOOLEAN NOT NULL DEFAULT false,
    "approval_route" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" TEXT NOT NULL,
    "trace_id" TEXT,
    "provider" TEXT,
    "provider_id" TEXT,
    "provider_event_name" TEXT,
    "provider_event_id" TEXT,
    "provider_resource_name" TEXT,
    "event_type" TEXT NOT NULL,
    "network_category" TEXT NOT NULL DEFAULT 'Communication',
    "source_channel" TEXT,
    "business_id" UUID,
    "business_external_id" TEXT,
    "customer_id" TEXT,
    "market_id" TEXT,
    "gbp_account_id" TEXT,
    "gbp_location_id" TEXT,
    "review_id" TEXT,
    "review_rating_raw" TEXT,
    "review_rating_numeric" INTEGER,
    "review_text" TEXT,
    "review_language" TEXT,
    "review_word_count" INTEGER,
    "review_has_comment" BOOLEAN NOT NULL DEFAULT false,
    "review_has_media" BOOLEAN NOT NULL DEFAULT false,
    "reviewer_display_name" TEXT,
    "author_name" TEXT,
    "reviewer_profile_photo_url" TEXT,
    "reviewer_is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "business_reply_exists" BOOLEAN NOT NULL DEFAULT false,
    "business_reply_text" TEXT,
    "business_reply_state" TEXT,
    "occurred_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "provider_updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "received_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "is_duplicate" BOOLEAN NOT NULL DEFAULT false,
    "requires_ai_extraction" BOOLEAN NOT NULL DEFAULT false,
    "ai_extraction_completed" BOOLEAN NOT NULL DEFAULT false,
    "processing_status" TEXT NOT NULL DEFAULT 'received',
    "handoff_eligible" BOOLEAN NOT NULL DEFAULT false,
    "unstructured_text" TEXT,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrichment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "ai_sentiment" TEXT,
    "ai_sentiment_score" DOUBLE PRECISION,
    "ai_review_tone" TEXT,
    "ai_praise_detected" BOOLEAN DEFAULT false,
    "ai_complaint_detected" BOOLEAN DEFAULT false,
    "ai_praise_topics" JSONB DEFAULT '[]',
    "ai_complaint_topics" JSONB DEFAULT '[]',
    "ai_primary_praise_topic" TEXT,
    "ai_primary_complaint_topic" TEXT,
    "ai_service_mentioned" TEXT,
    "ai_customer_experience_issue" TEXT,
    "ai_urgency_level" TEXT,
    "ai_summary" TEXT,
    "ai_suggested_response_type" TEXT,
    "ai_confidence_score" DOUBLE PRECISION,
    "intent" TEXT,
    "service_requested" TEXT,
    "problem_type" TEXT,
    "urgency_level" TEXT,
    "timeline" TEXT,
    "sentiment" TEXT,
    "summary" TEXT,
    "confidence_score" DOUBLE PRECISION,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrichment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID,
    "signal_rule_id" TEXT,
    "name" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 2,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "status" TEXT NOT NULL DEFAULT 'candidate',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID,
    "signal_id" UUID,
    "action_id" TEXT,
    "title" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "priority" INTEGER NOT NULL DEFAULT 2,
    "execution_mode" TEXT NOT NULL DEFAULT 'approval_required',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approvals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID,
    "action_id" UUID,
    "type" TEXT,
    "content" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metrics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "revenue_growth" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "booked_work" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reputation_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "suppressed_count" INTEGER NOT NULL DEFAULT 0,
    "human_intervention_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ai_accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outcomes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "action_id" UUID,
    "outcome_status" TEXT,
    "human_intervened" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID,
    "action_id" UUID,
    "signal_validated" BOOLEAN DEFAULT true,
    "action_approved" BOOLEAN DEFAULT true,
    "human_edited_output" BOOLEAN DEFAULT false,
    "action_completed" BOOLEAN DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "businesses_business_id_key" ON "businesses"("business_id");

-- CreateIndex
CREATE UNIQUE INDEX "businesses_gbp_location_id_key" ON "businesses"("gbp_location_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_orchestrator_profiles_business_id_key" ON "client_orchestrator_profiles"("business_id");

-- CreateIndex
CREATE UNIQUE INDEX "business_configurations_business_id_key" ON "business_configurations"("business_id");

-- CreateIndex
CREATE UNIQUE INDEX "safety_compliance_rules_rule_id_key" ON "safety_compliance_rules"("rule_id");

-- CreateIndex
CREATE UNIQUE INDEX "orchestrator_rules_rule_id_key" ON "orchestrator_rules"("rule_id");

-- CreateIndex
CREATE UNIQUE INDEX "action_library_action_id_key" ON "action_library"("action_id");

-- CreateIndex
CREATE UNIQUE INDEX "orchestrator_decisions_decision_id_key" ON "orchestrator_decisions"("decision_id");

-- CreateIndex
CREATE UNIQUE INDEX "action_queue_queue_trace_id_key" ON "action_queue"("queue_trace_id");

-- CreateIndex
CREATE UNIQUE INDEX "events_event_id_key" ON "events"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "events_provider_event_id_key" ON "events"("provider_event_id");

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_orchestrator_profiles" ADD CONSTRAINT "client_orchestrator_profiles_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_configurations" ADD CONSTRAINT "business_configurations_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orchestrator_rules" ADD CONSTRAINT "orchestrator_rules_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signal_action_mappings" ADD CONSTRAINT "signal_action_mappings_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orchestrator_decisions" ADD CONSTRAINT "orchestrator_decisions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_queue" ADD CONSTRAINT "action_queue_decision_id_fkey" FOREIGN KEY ("decision_id") REFERENCES "orchestrator_decisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrichment" ADD CONSTRAINT "enrichment_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signals" ADD CONSTRAINT "signals_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_signal_id_fkey" FOREIGN KEY ("signal_id") REFERENCES "signals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outcomes" ADD CONSTRAINT "outcomes_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
