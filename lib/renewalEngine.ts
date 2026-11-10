import { Customer, Policy, PolicyType } from '../types';

export type RenewalBucket = 'overdue' | 'due30' | 'due60' | 'due90' | 'safe';

export interface RenewalRadarItem {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    policyId: string;
    policyNumber: string;
    policyType: PolicyType;
    insurer: string;
    premium: number;
    endDate: string;
    daysRemaining: number;
    bucket: RenewalBucket;
    recommendedAction: string;
}

export interface RenewalRadarSummary {
    overdue: RenewalRadarItem[];
    due30: RenewalRadarItem[];
    due60: RenewalRadarItem[];
    due90: RenewalRadarItem[];
    totalAtRiskGwp: number;
    allActionable: RenewalRadarItem[];
}

export interface HouseholdProtectionProfile {
    completenessScore: number; // 0 - 100
    coveredLines: PolicyType[];
    missingLines: PolicyType[];
    totalAnnualGwp: number;
    activePoliciesCount: number;
    hasHomePolicy: boolean;
    enfiaEligible: boolean;
    missingEnfiaPerils: string[];
    priorityRecommendation: string;
}

const CORE_PILLARS: PolicyType[] = [
    PolicyType.AUTO,
    PolicyType.HOME,
    PolicyType.HEALTH,
    PolicyType.LIFE,
];

export function computeRenewalRadar(
    customers: Customer[],
    referenceDate: Date = new Date()
): RenewalRadarSummary {
    const refDayStart = new Date(
        referenceDate.getFullYear(),
        referenceDate.getMonth(),
        referenceDate.getDate()
    ).getTime();

    const overdue: RenewalRadarItem[] = [];
    const due30: RenewalRadarItem[] = [];
    const due60: RenewalRadarItem[] = [];
    const due90: RenewalRadarItem[] = [];

    for (const customer of customers) {
        for (const policy of customer.policies || []) {
            if (!policy.endDate) continue;
            const parsed = new Date(policy.endDate);
            if (Number.isNaN(parsed.getTime())) continue;

            const endDayStart = new Date(
                parsed.getFullYear(),
                parsed.getMonth(),
                parsed.getDate()
            ).getTime();
            const daysRemaining = Math.round((endDayStart - refDayStart) / 86_400_000);

            let bucket: RenewalBucket = 'safe';
            let recommendedAction = 'Monitor renewal window';

            if (daysRemaining < 0) {
                bucket = 'overdue';
                recommendedAction = 'Urgent: Policy expired — re-shop & bind reinstatement immediately';
            } else if (daysRemaining <= 30) {
                bucket = 'due30';
                recommendedAction = 'T-30 Window: Run 6-carrier comparative rater & send renewal link';
            } else if (daysRemaining <= 60) {
                bucket = 'due60';
                recommendedAction = 'T-60 Window: Audit household gaps & prepare retention quote';
            } else if (daysRemaining <= 90) {
                bucket = 'due90';
                recommendedAction = 'T-90 Window: Early carrier tariff check';
            }

            if (bucket === 'safe') continue;

            const item: RenewalRadarItem = {
                customerId: customer.id,
                customerName: `${customer.firstName} ${customer.lastName}`.trim(),
                customerEmail: customer.email,
                customerPhone: customer.phone || '',
                policyId: policy.id,
                policyNumber: policy.policyNumber,
                policyType: policy.type,
                insurer: policy.insurer,
                premium: Number(policy.premium) || 0,
                endDate: policy.endDate,
                daysRemaining,
                bucket,
                recommendedAction,
            };

            if (bucket === 'overdue') overdue.push(item);
            else if (bucket === 'due30') due30.push(item);
            else if (bucket === 'due60') due60.push(item);
            else if (bucket === 'due90') due90.push(item);
        }
    }

    const sortByUrgency = (a: RenewalRadarItem, b: RenewalRadarItem) =>
        a.daysRemaining - b.daysRemaining;

    overdue.sort(sortByUrgency);
    due30.sort(sortByUrgency);
    due60.sort(sortByUrgency);
    due90.sort(sortByUrgency);

    const allActionable = [...overdue, ...due30, ...due60, ...due90];
    const totalAtRiskGwp = Number(
        allActionable.reduce((sum, item) => sum + item.premium, 0).toFixed(2)
    );

    return {
        overdue,
        due30,
        due60,
        due90,
        totalAtRiskGwp,
        allActionable,
    };
}

function checkHomeEnfiaCompliance(homePolicies: Policy[]): {
    eligible: boolean;
    missingPerils: string[];
} {
    if (homePolicies.length === 0) {
        return { eligible: false, missingPerils: ['Fire', 'Earthquake', 'Flood / Natural Phenomena'] };
    }

    const allCoverageText = homePolicies
        .flatMap((p) => p.coverages || [])
        .map((c) => `${c.type} ${c.limit}`.toLowerCase())
        .join(' | ');

    const hasFire =
        allCoverageText.includes('fire') || allCoverageText.includes('πυρ');
    const hasEarthquake =
        allCoverageText.includes('earthquake') || allCoverageText.includes('σεισμ');
    const hasFlood =
        allCoverageText.includes('flood') ||
        allCoverageText.includes('natural') ||
        allCoverageText.includes('weather') ||
        allCoverageText.includes('πλημμύρ') ||
        allCoverageText.includes('φυσικ');

    const missingPerils: string[] = [];
    if (!hasFire) missingPerils.push('Fire');
    if (!hasEarthquake) missingPerils.push('Earthquake');
    if (!hasFlood) missingPerils.push('Flood / Natural Phenomena');

    return {
        eligible: missingPerils.length === 0,
        missingPerils,
    };
}

export function evaluateCustomerHouseholdProfile(
    customer: Customer
): HouseholdProtectionProfile {
    const activePolicies = (customer.policies || []).filter((p) => p.isActive !== false);
    const coveredSet = new Set<PolicyType>(activePolicies.map((p) => p.type));

    const coveredLines = CORE_PILLARS.filter((line) => coveredSet.has(line));
    const missingLines = CORE_PILLARS.filter((line) => !coveredSet.has(line));

    const totalAnnualGwp = Number(
        activePolicies.reduce((sum, p) => sum + (Number(p.premium) || 0), 0).toFixed(2)
    );

    const homePolicies = activePolicies.filter((p) => p.type === PolicyType.HOME);
    const hasHomePolicy = homePolicies.length > 0;
    const enfiaCheck = checkHomeEnfiaCompliance(homePolicies);

    // Base score: 22 points per core pillar (max 88) + 12 points for ENFIA catastrophe compliance (or full 4-line bundle)
    let completenessScore = coveredLines.length * 22;
    if (hasHomePolicy && enfiaCheck.eligible) {
        completenessScore += 12;
    } else if (!hasHomePolicy && coveredLines.length === 4) {
        completenessScore += 12;
    }
    completenessScore = Math.min(100, completenessScore);

    let priorityRecommendation = 'Household portfolio is well balanced across core risk lines.';
    if (hasHomePolicy && !enfiaCheck.eligible) {
        priorityRecommendation = `Add ${enfiaCheck.missingPerils.join(' & ')} endorsement to Home policy to unlock the statutory -20% ENFIA property tax reduction.`;
    } else if (missingLines.includes(PolicyType.HEALTH)) {
        priorityRecommendation =
            'Propose private Hospitalization & Diagnostic Health plan to protect household savings from medical emergencies.';
    } else if (missingLines.includes(PolicyType.HOME)) {
        priorityRecommendation =
            'Quote an ENFIA-eligible Home Catastrophe & Contents policy (Fire + Earthquake + Flood).';
    } else if (missingLines.includes(PolicyType.LIFE)) {
        priorityRecommendation =
            'Recommend Term Life income-replacement protection for family dependents.';
    } else if (missingLines.includes(PolicyType.AUTO)) {
        priorityRecommendation = 'Verify household vehicle fleet for multi-policy Auto discount.';
    }

    return {
        completenessScore,
        coveredLines,
        missingLines,
        totalAnnualGwp,
        activePoliciesCount: activePolicies.length,
        hasHomePolicy,
        enfiaEligible: enfiaCheck.eligible,
        missingEnfiaPerils: enfiaCheck.missingPerils,
        priorityRecommendation,
    };
}

export function buildCoverageAuditDocument(
    customer: Customer,
    profile: HouseholdProtectionProfile
): string {
    const generatedAt = new Date().toISOString().split('T')[0];
    const policiesHtml = (customer.policies || [])
        .map(
            (p) => `
        <tr>
            <td><strong>${p.policyNumber}</strong></td>
            <td>${p.type.toUpperCase()}</td>
            <td>${p.insurer}</td>
            <td>${p.endDate}</td>
            <td style="text-align:right">€${Number(p.premium).toFixed(2)}</td>
        </tr>`
        )
        .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Household Coverage Audit — ${customer.firstName} ${customer.lastName}</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; max-width: 820px; margin: 32px auto; padding: 0 24px; line-height: 1.5; }
  header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
  h1 { margin: 0; font-size: 22px; }
  .kpi-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
  .kpi { border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; }
  .kpi span { display: block; font-size: 11px; text-transform: uppercase; color: #64748b; }
  .kpi strong { font-size: 20px; font-variant-numeric: tabular-nums; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0 24px; font-size: 14px; font-variant-numeric: tabular-nums; }
  th, td { border-bottom: 1px solid #e2e8f0; padding: 10px 8px; text-align: left; }
  th { background: #f8fafc; font-size: 12px; text-transform: uppercase; color: #475569; }
  .box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin-top: 16px; }
</style>
</head>
<body>
  <header>
    <div>
      <h1>Household Insurance & Risk Advisory Dossier</h1>
      <div>Client: <strong>${customer.firstName} ${customer.lastName}</strong> (${customer.email})</div>
    </div>
    <div>Date: <strong>${generatedAt}</strong></div>
  </header>
  <div class="kpi-row">
    <div class="kpi"><span>Protection Score</span><strong>${profile.completenessScore}/100</strong></div>
    <div class="kpi"><span>Active Annual GWP</span><strong>€${profile.totalAnnualGwp.toFixed(2)}</strong></div>
    <div class="kpi"><span>ENFIA -20% Tax Status</span><strong>${profile.enfiaEligible ? 'Eligible' : 'Action Needed'}</strong></div>
  </div>
  <h2>Active Policies</h2>
  <table>
    <thead><tr><th>Policy #</th><th>Line</th><th>Carrier</th><th>Renewal Date</th><th style="text-align:right">Annual Premium</th></tr></thead>
    <tbody>${policiesHtml}</tbody>
  </table>
  <div class="box">
    <strong>Priority Underwriting Recommendation (EU IDD Advisory):</strong>
    <p>${profile.priorityRecommendation}</p>
    <p>Uninsured Core Pillars: ${profile.missingLines.length > 0 ? profile.missingLines.map((l) => l.toUpperCase()).join(', ') : 'None'}</p>
  </div>
</body>
</html>`;
}
