-- CreateEnum for BillingPlan
CREATE TYPE "BillingPlan" AS ENUM ('PERFORMANCE', 'STARTER', 'PRO', 'DIY');

-- CreateEnum for ConnectOnboardingStatus
CREATE TYPE "ConnectOnboardingStatus" AS ENUM ('PENDING', 'INCOMPLETE', 'COMPLETE', 'RESTRICTED');

-- CreateEnum for DepositStatus
CREATE TYPE "DepositStatus" AS ENUM ('AUTHORIZED', 'CAPTURED', 'RELEASED', 'CANCELED', 'EXPIRED');

-- CreateEnum for DisputeStatus
CREATE TYPE "DisputeStatus" AS ENUM ('WARNING_NEEDS_RESPONSE', 'WARNING_UNDER_REVIEW', 'WARNING_CLOSED', 'NEEDS_RESPONSE', 'UNDER_REVIEW', 'CHARGE_REFUNDED', 'WON', 'LOST');

-- CreateTable TenantBillingProfile
CREATE TABLE "TenantBillingProfile" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "plan" "BillingPlan" NOT NULL DEFAULT 'PERFORMANCE',
    "planStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performanceEndsAt" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "stripePaymentMethodId" TEXT,
    "stripeSubscriptionId" TEXT,
    "feePercentCurrent" DECIMAL(5,2) NOT NULL DEFAULT 7.0,
    "feePercentAfter" DECIMAL(5,2) NOT NULL DEFAULT 2.0,
    "feeMinimumCents" INTEGER,
    "cardOnFile" BOOLEAN NOT NULL DEFAULT false,
    "billingEmail" TEXT,
    "taxId" TEXT,
    "country" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantBillingProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable TenantStripeConnect
CREATE TABLE "TenantStripeConnect" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "stripeAccountId" TEXT NOT NULL,
    "onboardingStatus" "ConnectOnboardingStatus" NOT NULL DEFAULT 'PENDING',
    "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "chargesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "detailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "requirements" JSONB,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantStripeConnect_pkey" PRIMARY KEY ("id")
);

-- CreateTable BookingFeeLedger
CREATE TABLE "BookingFeeLedger" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "applicationFeeCents" INTEGER NOT NULL,
    "feePercentApplied" DECIMAL(5,2) NOT NULL,
    "planSnapshot" "BillingPlan" NOT NULL,
    "bookingAmountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "stripeTransferId" TEXT,
    "stripeBalanceTxnId" TEXT,
    "refundedCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingFeeLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable DepositAuthorization
CREATE TABLE "DepositAuthorization" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "DepositStatus" NOT NULL DEFAULT 'AUTHORIZED',
    "capturedCents" INTEGER NOT NULL DEFAULT 0,
    "releasedAt" TIMESTAMP(3),
    "capturedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepositAuthorization_pkey" PRIMARY KEY ("id")
);

-- CreateTable WebhookEventLog
CREATE TABLE "WebhookEventLog" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processingError" TEXT,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEventLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable AuditLog
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "actorType" TEXT NOT NULL DEFAULT 'user',
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable Dispute
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "stripeDisputeId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL,
    "evidenceDueBy" TIMESTAMP(3),
    "evidenceDetails" JSONB,
    "isChargeRefundable" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantBillingProfile_tenantId_key" ON "TenantBillingProfile"("tenantId");
CREATE UNIQUE INDEX "TenantBillingProfile_stripeCustomerId_key" ON "TenantBillingProfile"("stripeCustomerId");
CREATE INDEX "TenantBillingProfile_plan_idx" ON "TenantBillingProfile"("plan");
CREATE INDEX "TenantBillingProfile_performanceEndsAt_idx" ON "TenantBillingProfile"("performanceEndsAt");

CREATE UNIQUE INDEX "TenantStripeConnect_tenantId_key" ON "TenantStripeConnect"("tenantId");
CREATE UNIQUE INDEX "TenantStripeConnect_stripeAccountId_key" ON "TenantStripeConnect"("stripeAccountId");
CREATE INDEX "TenantStripeConnect_stripeAccountId_idx" ON "TenantStripeConnect"("stripeAccountId");
CREATE INDEX "TenantStripeConnect_onboardingStatus_idx" ON "TenantStripeConnect"("onboardingStatus");

CREATE INDEX "BookingFeeLedger_bookingId_idx" ON "BookingFeeLedger"("bookingId");
CREATE INDEX "BookingFeeLedger_tenantId_idx" ON "BookingFeeLedger"("tenantId");
CREATE INDEX "BookingFeeLedger_createdAt_idx" ON "BookingFeeLedger"("createdAt");

CREATE UNIQUE INDEX "DepositAuthorization_bookingId_key" ON "DepositAuthorization"("bookingId");
CREATE UNIQUE INDEX "DepositAuthorization_stripePaymentIntentId_key" ON "DepositAuthorization"("stripePaymentIntentId");
CREATE INDEX "DepositAuthorization_bookingId_idx" ON "DepositAuthorization"("bookingId");
CREATE INDEX "DepositAuthorization_status_idx" ON "DepositAuthorization"("status");

CREATE UNIQUE INDEX "WebhookEventLog_eventId_key" ON "WebhookEventLog"("eventId");
CREATE INDEX "WebhookEventLog_eventType_idx" ON "WebhookEventLog"("eventType");
CREATE INDEX "WebhookEventLog_processed_idx" ON "WebhookEventLog"("processed");
CREATE INDEX "WebhookEventLog_createdAt_idx" ON "WebhookEventLog"("createdAt");

CREATE INDEX "AuditLog_actor_idx" ON "AuditLog"("actor");
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

CREATE UNIQUE INDEX "Dispute_stripeDisputeId_key" ON "Dispute"("stripeDisputeId");
CREATE INDEX "Dispute_bookingId_idx" ON "Dispute"("bookingId");
CREATE INDEX "Dispute_status_idx" ON "Dispute"("status");
CREATE INDEX "Dispute_evidenceDueBy_idx" ON "Dispute"("evidenceDueBy");

-- AddForeignKey
ALTER TABLE "TenantStripeConnect" ADD CONSTRAINT "TenantStripeConnect_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "TenantBillingProfile"("tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingFeeLedger" ADD CONSTRAINT "BookingFeeLedger_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "TenantBillingProfile"("tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;
