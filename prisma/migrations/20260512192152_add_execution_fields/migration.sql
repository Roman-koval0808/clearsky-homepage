/*
  Warnings:

  - You are about to drop the column `action_approved` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the column `action_completed` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the column `human_edited_output` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the column `signal_validated` on the `feedback` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "feedback" DROP COLUMN "action_approved",
DROP COLUMN "action_completed",
DROP COLUMN "human_edited_output",
DROP COLUMN "notes",
DROP COLUMN "signal_validated",
ADD COLUMN     "content" TEXT,
ADD COLUMN     "type" TEXT;

-- CreateTable
CREATE TABLE "action_executions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "action_execution_id" TEXT NOT NULL,
    "action_queue_id" UUID NOT NULL,
    "action_id" TEXT NOT NULL,
    "execution_mode" TEXT NOT NULL,
    "execution_status" TEXT NOT NULL DEFAULT 'created_pending_route',
    "generated_output" TEXT,
    "approval_status" TEXT,
    "approval_owner" TEXT,
    "requires_human_approval" BOOLEAN NOT NULL DEFAULT false,
    "approved_at" TIMESTAMPTZ(6),
    "rejected_at" TIMESTAMPTZ(6),
    "human_edited" BOOLEAN NOT NULL DEFAULT false,
    "edited_output" TEXT,
    "posted_externally" BOOLEAN NOT NULL DEFAULT false,
    "failure_reason" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_packages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "approval_package_id" TEXT NOT NULL,
    "execution_id" UUID NOT NULL,
    "owner" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_approval',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaint_theme_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "exec_id" UUID NOT NULL,
    "theme" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complaint_theme_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "action_executions_action_execution_id_key" ON "action_executions"("action_execution_id");

-- CreateIndex
CREATE UNIQUE INDEX "approval_packages_approval_package_id_key" ON "approval_packages"("approval_package_id");

-- AddForeignKey
ALTER TABLE "action_executions" ADD CONSTRAINT "action_executions_action_queue_id_fkey" FOREIGN KEY ("action_queue_id") REFERENCES "action_queue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_packages" ADD CONSTRAINT "approval_packages_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "action_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_theme_logs" ADD CONSTRAINT "complaint_theme_logs_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_theme_logs" ADD CONSTRAINT "complaint_theme_logs_exec_id_fkey" FOREIGN KEY ("exec_id") REFERENCES "action_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
