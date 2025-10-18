import { prisma } from '@valore/database';
import { BillingPlan } from '@prisma/client';
import { getActiveFeePercent, calculateApplicationFee } from './stripe';

export async function getOrCreateTenantBilling(tenantId: string) {
  let billing = await prisma.tenantBillingProfile.findUnique({
    where: { tenantId },
    include: {
      connectAccount: true,
    },
  });

  if (!billing) {
    const performanceEndsAt = new Date();
    performanceEndsAt.setDate(performanceEndsAt.getDate() + 60);

    billing = await prisma.tenantBillingProfile.create({
      data: {
        tenantId,
        plan: 'PERFORMANCE',
        planStartedAt: new Date(),
        performanceEndsAt,
        feePercentCurrent: 7.0,
        feePercentAfter: 2.0,
        country: 'US',
        currency: 'USD',
      },
      include: {
        connectAccount: true,
      },
    });
  }

  return billing;
}

export async function calculateBookingFee(
  tenantId: string,
  bookingAmountCents: number
): Promise<{
  applicationFeeCents: number;
  feePercent: number;
  plan: BillingPlan;
}> {
  const billing = await getOrCreateTenantBilling(tenantId);

  const feePercent = getActiveFeePercent(
    billing.plan,
    billing.planStartedAt,
    billing.performanceEndsAt
  );

  const applicationFeeCents = calculateApplicationFee(
    bookingAmountCents,
    feePercent,
    billing.feeMinimumCents || undefined
  );

  return {
    applicationFeeCents,
    feePercent,
    plan: billing.plan,
  };
}

export async function recordBookingFee(params: {
  bookingId: string;
  tenantId: string;
  applicationFeeCents: number;
  feePercent: number;
  plan: BillingPlan;
  bookingAmountCents: number;
  currency: string;
  stripeTransferId?: string;
  stripeBalanceTxnId?: string;
}) {
  return await prisma.bookingFeeLedger.create({
    data: {
      bookingId: params.bookingId,
      tenantId: params.tenantId,
      applicationFeeCents: params.applicationFeeCents,
      feePercentApplied: params.feePercent,
      planSnapshot: params.plan,
      bookingAmountCents: params.bookingAmountCents,
      currency: params.currency,
      stripeTransferId: params.stripeTransferId,
      stripeBalanceTxnId: params.stripeBalanceTxnId,
    },
  });
}

export async function switchPlan(
  tenantId: string,
  newPlan: BillingPlan,
  metadata?: {
    stripeSubscriptionId?: string;
    actor: string;
    reason?: string;
  }
) {
  const billing = await getOrCreateTenantBilling(tenantId);
  const oldPlan = billing.plan;

  let feePercentCurrent = 0;
  let feePercentAfter = 0;
  let performanceEndsAt = billing.performanceEndsAt;

  switch (newPlan) {
    case 'PERFORMANCE':
      feePercentCurrent = 7.0;
      feePercentAfter = 2.0;
      performanceEndsAt = new Date();
      performanceEndsAt.setDate(performanceEndsAt.getDate() + 60);
      break;
    case 'STARTER':
      feePercentCurrent = 3.0;
      feePercentAfter = 3.0;
      // End Performance period immediately when switching to Starter
      performanceEndsAt = new Date();
      break;
    case 'PRO':
      feePercentCurrent = 1.0;
      feePercentAfter = 1.0;
      // End Performance period immediately when switching to Pro
      performanceEndsAt = new Date();
      break;
    case 'DIY':
      feePercentCurrent = 0;
      feePercentAfter = 0;
      performanceEndsAt = null;
      break;
  }

  const updatedBilling = await prisma.tenantBillingProfile.update({
    where: { tenantId },
    data: {
      plan: newPlan,
      planStartedAt: new Date(),
      performanceEndsAt,
      feePercentCurrent,
      feePercentAfter,
      stripeSubscriptionId: metadata?.stripeSubscriptionId || billing.stripeSubscriptionId,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      actor: metadata?.actor || 'system',
      actorType: 'user',
      action: 'plan_switched',
      entity: 'TenantBillingProfile',
      entityId: tenantId,
      before: { plan: oldPlan },
      after: { plan: newPlan },
      metadata: metadata ? { reason: metadata.reason } : undefined,
    },
  });

  return updatedBilling;
}

export async function getDashboardStats(tenantId: string) {
  const billing = await getOrCreateTenantBilling(tenantId);
  
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Get month-to-date stats
  const mtdLedger = await prisma.bookingFeeLedger.findMany({
    where: {
      tenantId,
      createdAt: {
        gte: monthStart,
      },
    },
  });

  const mtdBookings = mtdLedger.length;
  const mtdGMV = mtdLedger.reduce((sum, entry) => sum + entry.bookingAmountCents, 0);
  const mtdFees = mtdLedger.reduce((sum, entry) => sum + entry.applicationFeeCents, 0);

  let daysLeftInPerformance = 0;
  if (billing.plan === 'PERFORMANCE' && billing.performanceEndsAt) {
    const diff = billing.performanceEndsAt.getTime() - now.getTime();
    daysLeftInPerformance = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return {
    plan: billing.plan,
    planStartedAt: billing.planStartedAt,
    performanceEndsAt: billing.performanceEndsAt,
    daysLeftInPerformance,
    currentFeePercent: getActiveFeePercent(
      billing.plan,
      billing.planStartedAt,
      billing.performanceEndsAt
    ),
    mtdStats: {
      bookings: mtdBookings,
      gmvCents: mtdGMV,
      feesCents: mtdFees,
    },
    stripeCustomerId: billing.stripeCustomerId,
    cardOnFile: billing.cardOnFile,
  };
}
