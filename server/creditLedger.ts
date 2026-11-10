export type PlanTierId = 'starter' | 'pro' | 'enterprise';
export type AiOperationType = 'generate' | 'generate-image' | 'parse-policy' | 'analyze-gaps';

export interface BillingInvoice {
  id: string;
  mydataMark: string;
  date: string;
  planName: string;
  netAmount: number;
  vatAmount: number;
  amount: number;
  status: 'paid' | 'issued';
}

export interface AgencyBillingState {
  agencyId: string;
  planId: PlanTierId;
  aiCredits: {
    used: number;
    limit: number;
    percent: number;
  };
  seats: {
    used: number;
    limit: number;
    percent: number;
  };
  storage: {
    used: number;
    limit: number;
    unit: 'GB';
    percent: number;
  };
  overage: {
    isEnabled: boolean;
    monthlyBudgetCap: number;
    currentUsageCost: number;
  };
  invoices: BillingInvoice[];
  updatedAt: string;
}

export const PLAN_CATALOG: Record<
  PlanTierId,
  { name: string; monthlyPrice: number; creditLimit: number; seatLimit: number; storageLimitGb: number }
> = {
  starter: {
    name: 'Starter',
    monthlyPrice: 0,
    creditLimit: 1000,
    seatLimit: 1,
    storageLimitGb: 2,
  },
  pro: {
    name: 'Pro Agency',
    monthlyPrice: 49,
    creditLimit: 5000,
    seatLimit: 5,
    storageLimitGb: 10,
  },
  enterprise: {
    name: 'Enterprise Network',
    monthlyPrice: 199,
    creditLimit: 25000,
    seatLimit: 50,
    storageLimitGb: 100,
  },
};

export const AI_CREDIT_COSTS: Record<AiOperationType, number> = {
  generate: 25,
  'generate-image': 100,
  'parse-policy': 75,
  'analyze-gaps': 75,
};

// €0.01 per overage credit (e.g., 100 overage credits = €1.00)
export const OVERAGE_EURO_PER_CREDIT = 0.01;

export function createDefaultAgencyBilling(agencyId: string): AgencyBillingState {
  return {
    agencyId,
    planId: 'pro',
    aiCredits: {
      used: 4500,
      limit: 5000,
      percent: 90,
    },
    seats: {
      used: 2,
      limit: 5,
      percent: 40,
    },
    storage: {
      used: 1.4,
      limit: 10,
      unit: 'GB',
      percent: 14,
    },
    overage: {
      isEnabled: true,
      monthlyBudgetCap: 50.0,
      currentUsageCost: 0.0,
    },
    invoices: [
      {
        id: 'INV-2026-1101',
        mydataMark: '400001928374651',
        date: '2026-11-01',
        planName: 'Pro Agency',
        netAmount: 39.52,
        vatAmount: 9.48,
        amount: 49.0,
        status: 'paid',
      },
      {
        id: 'INV-2026-1001',
        mydataMark: '400001884726109',
        date: '2026-10-01',
        planName: 'Pro Agency',
        netAmount: 39.52,
        vatAmount: 9.48,
        amount: 49.0,
        status: 'paid',
      },
      {
        id: 'INV-2026-0901',
        mydataMark: '400001792310482',
        date: '2026-09-01',
        planName: 'Pro Agency',
        netAmount: 39.52,
        vatAmount: 9.48,
        amount: 49.0,
        status: 'paid',
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

export interface CreditCheckResult {
  allowed: boolean;
  reason?: string;
  creditsCharged: number;
  overageEuroCharged: number;
  warningLevel: 'none' | 'approaching_80' | 'limit_reached';
  state: AgencyBillingState;
}

export function consumeAiCredits(
  current: AgencyBillingState,
  operation: AiOperationType,
  customCredits?: number
): CreditCheckResult {
  const creditsNeeded = customCredits ?? AI_CREDIT_COSTS[operation] ?? 25;
  const remainingIncluded = Math.max(0, current.aiCredits.limit - current.aiCredits.used);
  const overageCredits = Math.max(0, creditsNeeded - remainingIncluded);
  const overageCost = Number((overageCredits * OVERAGE_EURO_PER_CREDIT).toFixed(2));

  if (overageCredits > 0) {
    if (!current.overage.isEnabled) {
      return {
        allowed: false,
        reason: 'Monthly included AI credits exhausted and Flex-Budget overage is disabled.',
        creditsCharged: 0,
        overageEuroCharged: 0,
        warningLevel: 'limit_reached',
        state: current,
      };
    }

    const projectedOverage = Number((current.overage.currentUsageCost + overageCost).toFixed(2));
    if (projectedOverage > current.overage.monthlyBudgetCap) {
      return {
        allowed: false,
        reason: `Flex-Budget monthly cap (€${current.overage.monthlyBudgetCap.toFixed(2)}) reached.`,
        creditsCharged: 0,
        overageEuroCharged: 0,
        warningLevel: 'limit_reached',
        state: current,
      };
    }
  }

  const newUsed = current.aiCredits.used + creditsNeeded;
  const newPercent = Math.min(100, Math.round((newUsed / Math.max(1, current.aiCredits.limit)) * 100));
  const newOverageCost = Number((current.overage.currentUsageCost + overageCost).toFixed(2));

  let warningLevel: 'none' | 'approaching_80' | 'limit_reached' = 'none';
  if (current.overage.monthlyBudgetCap > 0) {
    const capRatio = newOverageCost / current.overage.monthlyBudgetCap;
    if (capRatio >= 1) warningLevel = 'limit_reached';
    else if (capRatio >= 0.8) warningLevel = 'approaching_80';
  }

  const nextState: AgencyBillingState = {
    ...current,
    aiCredits: {
      used: newUsed,
      limit: current.aiCredits.limit,
      percent: newPercent,
    },
    overage: {
      ...current.overage,
      currentUsageCost: newOverageCost,
    },
    updatedAt: new Date().toISOString(),
  };

  return {
    allowed: true,
    creditsCharged: creditsNeeded,
    overageEuroCharged: overageCost,
    warningLevel,
    state: nextState,
  };
}

export function changeAgencyPlan(current: AgencyBillingState, newPlanId: PlanTierId): AgencyBillingState {
  const spec = PLAN_CATALOG[newPlanId];
  const percent = Math.min(100, Math.round((current.aiCredits.used / spec.creditLimit) * 100));
  const seatPercent = Math.min(100, Math.round((current.seats.used / spec.seatLimit) * 100));
  const storagePercent = Math.min(100, Math.round((current.storage.used / spec.storageLimitGb) * 100));

  const newInvoices = [...current.invoices];
  if (spec.monthlyPrice > 0 && current.planId !== newPlanId) {
    const netAmount = Number((spec.monthlyPrice / 1.24).toFixed(2));
    const vatAmount = Number((spec.monthlyPrice - netAmount).toFixed(2));
    newInvoices.unshift({
      id: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      mydataMark: `40000${String(Date.now()).slice(-10)}`,
      date: new Date().toISOString().split('T')[0],
      planName: spec.name,
      netAmount,
      vatAmount,
      amount: spec.monthlyPrice,
      status: 'paid',
    });
  }

  return {
    ...current,
    planId: newPlanId,
    aiCredits: {
      used: current.aiCredits.used,
      limit: spec.creditLimit,
      percent,
    },
    seats: {
      used: current.seats.used,
      limit: spec.seatLimit,
      percent: seatPercent,
    },
    storage: {
      used: current.storage.used,
      limit: spec.storageLimitGb,
      unit: 'GB',
      percent: storagePercent,
    },
    invoices: newInvoices,
    updatedAt: new Date().toISOString(),
  };
}
