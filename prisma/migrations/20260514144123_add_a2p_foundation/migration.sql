-- AlterTable
ALTER TABLE "action_library" ADD COLUMN     "calls_a2p" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "call_event_id" UUID;

-- CreateTable
CREATE TABLE "raw_webhook_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "external_id" TEXT,
    "raw_payload" JSONB NOT NULL,
    "received_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "raw_webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "call_event_id" TEXT NOT NULL,
    "call_id" TEXT NOT NULL,
    "caller_id" TEXT,
    "called_number" TEXT,
    "call_started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "call_ended_at" TIMESTAMPTZ(6),
    "channel" TEXT NOT NULL DEFAULT 'phone',
    "call_priority" TEXT NOT NULL DEFAULT 'standard',
    "call_outcome" TEXT NOT NULL DEFAULT 'pending',
    "ivr_path" TEXT,
    "recording_url" TEXT,
    "profile_id" UUID,
    "transcript_id" UUID,
    "ai_analysis_id" UUID,

    CONSTRAINT "call_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voicemails" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "voicemail_id" TEXT NOT NULL,
    "call_event_id" UUID NOT NULL,
    "profile_id" UUID,
    "recording_url" TEXT,
    "duration_seconds" INTEGER,
    "transcript_status" TEXT NOT NULL DEFAULT 'pending',
    "transcript_id" UUID,
    "ai_analysis_id" UUID,
    "captured_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voicemails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "call_events_call_event_id_key" ON "call_events"("call_event_id");

-- CreateIndex
CREATE UNIQUE INDEX "call_events_call_id_key" ON "call_events"("call_id");

-- CreateIndex
CREATE UNIQUE INDEX "voicemails_voicemail_id_key" ON "voicemails"("voicemail_id");

-- AddForeignKey
ALTER TABLE "call_events" ADD CONSTRAINT "call_events_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "customer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voicemails" ADD CONSTRAINT "voicemails_call_event_id_fkey" FOREIGN KEY ("call_event_id") REFERENCES "call_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voicemails" ADD CONSTRAINT "voicemails_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "customer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_call_event_id_fkey" FOREIGN KEY ("call_event_id") REFERENCES "call_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
