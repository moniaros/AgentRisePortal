import { Customer, PolicyType } from '../types';

export interface BordereauxRow {
    policyId: string;
    policyNumber: string;
    customerName: string;
    insurer: string;
    policyType: PolicyType;
    grossPremium: number;
    netPremium: number;
    commissionRate: number;
    grossCommission: number;
    subAgentSplitEuro: number;
    agencyNetRetainedEuro: number;
    settlementStatus: 'Matched' | 'Pending Remittance';
}

export interface CarrierCommissionSummary {
    insurer: string;
    policyCount: number;
    totalGwp: number;
    grossCommission: number;
    agencyNetRetained: number;
}

export interface AgencyCommissionLedger {
    totalPortfolioGwp: number;
    totalNetPremium: number;
    totalGrossCommission: number;
    totalSubAgentPayout: number;
    totalAgencyNetRetained: number;
    rows: BordereauxRow[];
    byCarrier: CarrierCommissionSummary[];
}

const DEFAULT_COMMISSION_BY_LINE: Record<PolicyType, number> = {
    [PolicyType.AUTO]: 0.16,
    [PolicyType.HOME]: 0.22,
    [PolicyType.HEALTH]: 0.19,
    [PolicyType.LIFE]: 0.28,
};

const SUB_AGENT_SHARE = 0.4; // 60% retained by brokerage, 40% paid to producing agent

export function computeAgencyCommissions(customers: Customer[]): AgencyCommissionLedger {
    const rows: BordereauxRow[] = [];
    const carrierMap = new Map<string, CarrierCommissionSummary>();

    for (const customer of customers) {
        for (const policy of customer.policies || []) {
            if (policy.isActive === false) continue;

            const grossPremium = Number((Number(policy.premium) || 0).toFixed(2));
            const netPremium = Number((grossPremium / 1.15).toFixed(2));
            const commissionRate = DEFAULT_COMMISSION_BY_LINE[policy.type] ?? 0.17;
            const grossCommission = Number((netPremium * commissionRate).toFixed(2));
            const subAgentSplitEuro = Number((grossCommission * SUB_AGENT_SHARE).toFixed(2));
            const agencyNetRetainedEuro = Number(
                (grossCommission - subAgentSplitEuro).toFixed(2)
            );

            // Deterministic reconciliation status: recently bound or high-value life/health pending monthly carrier cycle
            const settlementStatus: 'Matched' | 'Pending Remittance' =
                policy.type === PolicyType.HEALTH || policy.policyNumber.includes('-') && grossPremium > 1000
                    ? 'Pending Remittance'
                    : 'Matched';

            const row: BordereauxRow = {
                policyId: policy.id,
                policyNumber: policy.policyNumber,
                customerName: `${customer.firstName} ${customer.lastName}`.trim(),
                insurer: policy.insurer || 'Carrier',
                policyType: policy.type,
                grossPremium,
                netPremium,
                commissionRate,
                grossCommission,
                subAgentSplitEuro,
                agencyNetRetainedEuro,
                settlementStatus,
            };
            rows.push(row);

            const existing = carrierMap.get(row.insurer) || {
                insurer: row.insurer,
                policyCount: 0,
                totalGwp: 0,
                grossCommission: 0,
                agencyNetRetained: 0,
            };
            existing.policyCount += 1;
            existing.totalGwp = Number((existing.totalGwp + grossPremium).toFixed(2));
            existing.grossCommission = Number(
                (existing.grossCommission + grossCommission).toFixed(2)
            );
            existing.agencyNetRetained = Number(
                (existing.agencyNetRetained + agencyNetRetainedEuro).toFixed(2)
            );
            carrierMap.set(row.insurer, existing);
        }
    }

    const totalPortfolioGwp = Number(
        rows.reduce((s, r) => s + r.grossPremium, 0).toFixed(2)
    );
    const totalNetPremium = Number(
        rows.reduce((s, r) => s + r.netPremium, 0).toFixed(2)
    );
    const totalGrossCommission = Number(
        rows.reduce((s, r) => s + r.grossCommission, 0).toFixed(2)
    );
    const totalSubAgentPayout = Number(
        rows.reduce((s, r) => s + r.subAgentSplitEuro, 0).toFixed(2)
    );
    const totalAgencyNetRetained = Number(
        rows.reduce((s, r) => s + r.agencyNetRetainedEuro, 0).toFixed(2)
    );

    const byCarrier = Array.from(carrierMap.values()).sort(
        (a, b) => b.grossCommission - a.grossCommission
    );

    return {
        totalPortfolioGwp,
        totalNetPremium,
        totalGrossCommission,
        totalSubAgentPayout,
        totalAgencyNetRetained,
        rows,
        byCarrier,
    };
}

export function buildBordereauxCsv(ledger: AgencyCommissionLedger): string {
    const header = [
        'Policy Number',
        'Policyholder',
        'Carrier',
        'Line',
        'Gross Premium (EUR)',
        'Net Premium (EUR)',
        'Commission Rate (%)',
        'Gross Commission (EUR)',
        'Sub-Agent Split 40% (EUR)',
        'Agency Net Retained 60% (EUR)',
        'Bordereaux Status',
    ].join(',');

    const body = ledger.rows.map((r) =>
        [
            `"${r.policyNumber}"`,
            `"${r.customerName}"`,
            `"${r.insurer}"`,
            r.policyType.toUpperCase(),
            r.grossPremium.toFixed(2),
            r.netPremium.toFixed(2),
            (r.commissionRate * 100).toFixed(1),
            r.grossCommission.toFixed(2),
            r.subAgentSplitEuro.toFixed(2),
            r.agencyNetRetainedEuro.toFixed(2),
            `"${r.settlementStatus}"`,
        ].join(',')
    );

    return [header, ...body].join('\n');
}
