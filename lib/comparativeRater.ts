import { Coverage, PolicyType } from '../types';

export interface RatingInput {
    policyType: PolicyType;
    assetValue: number; // e.g. Vehicle value €15,000, Home rebuild value €180,000, Life capital €200,000
    squareMeters?: number; // For Home insurance
    driverOrInsuredAge?: number; // Default 38
    includeCatastrophePerils?: boolean; // Earthquake + Fire + Flood (ENFIA 20% discount requirement)
    hospitalClass?: 'A' | 'B' | 'Lux';
}

export interface CarrierQuote {
    id: string;
    carrierName: string;
    tierLabel: string;
    policyType: PolicyType;
    annualGrossPremium: number;
    monthlyEquivalent: number;
    netPremium: number;
    deductible: string;
    commissionRate: number; // e.g. 0.18 = 18%
    commissionEuro: number;
    enfiaTaxDiscountEligible: boolean;
    valueScore: number; // 0-100 actuarial price-to-coverage ratio
    coverages: Coverage[];
}

interface CarrierSpec {
    code: string;
    name: string;
    tier: string;
    rateMultiplier: number;
    deductibleFactor: number;
    commissionByLine: Record<PolicyType, number>;
    extraPerks: Record<PolicyType, string>;
}

const CARRIERS: CarrierSpec[] = [
    {
        code: 'hellas_direct',
        name: 'Hellas Direct',
        tier: 'Digital Fast-Track',
        rateMultiplier: 0.88,
        deductibleFactor: 1.25,
        commissionByLine: {
            [PolicyType.AUTO]: 0.14,
            [PolicyType.HOME]: 0.2,
            [PolicyType.HEALTH]: 0.15,
            [PolicyType.LIFE]: 0.22,
        },
        extraPerks: {
            [PolicyType.AUTO]: '24/7 Fast-Track Roadside & App Claim Triage',
            [PolicyType.HOME]: 'Instant Weather Alert & Glass Breakage',
            [PolicyType.HEALTH]: 'Telemedicine 24/7 Unlimited',
            [PolicyType.LIFE]: 'Digital Instant Underwriting',
        },
    },
    {
        code: 'interamerican',
        name: 'Interamerican',
        tier: 'Drive & Medipro Network',
        rateMultiplier: 1.02,
        deductibleFactor: 1.0,
        commissionByLine: {
            [PolicyType.AUTO]: 0.16,
            [PolicyType.HOME]: 0.22,
            [PolicyType.HEALTH]: 0.19,
            [PolicyType.LIFE]: 0.28,
        },
        extraPerks: {
            [PolicyType.AUTO]: 'Own Roadside Fleet & Replacement Vehicle',
            [PolicyType.HOME]: 'Emergency Plumber/Locksmith Home Assist',
            [PolicyType.HEALTH]: 'Medisystem Direct Hospital Settlement',
            [PolicyType.LIFE]: 'Waiver of Premium on Disability',
        },
    },
    {
        code: 'generali',
        name: 'Generali Hellas',
        tier: 'Red Umbrella Executive',
        rateMultiplier: 1.06,
        deductibleFactor: 0.8,
        commissionByLine: {
            [PolicyType.AUTO]: 0.17,
            [PolicyType.HOME]: 0.24,
            [PolicyType.HEALTH]: 0.2,
            [PolicyType.LIFE]: 0.3,
        },
        extraPerks: {
            [PolicyType.AUTO]: 'New-for-Old Total Loss Protection',
            [PolicyType.HOME]: 'Short-Term Rental Liability & Cyber Home',
            [PolicyType.HEALTH]: 'EU & Global Oncology Second Opinion',
            [PolicyType.LIFE]: 'Family Income Multiplier Rider',
        },
    },
    {
        code: 'ethniki',
        name: 'Ethniki Asfalistiki',
        tier: 'Full Shield Classic',
        rateMultiplier: 1.09,
        deductibleFactor: 0.75,
        commissionByLine: {
            [PolicyType.AUTO]: 0.15,
            [PolicyType.HOME]: 0.21,
            [PolicyType.HEALTH]: 0.18,
            [PolicyType.LIFE]: 0.27,
        },
        extraPerks: {
            [PolicyType.AUTO]: 'Legal Protection €15,000 & Personal Accident',
            [PolicyType.HOME]: 'Reconstruction Cost Indexation Protection',
            [PolicyType.HEALTH]: '100% Contracted Private Clinics Greece',
            [PolicyType.LIFE]: 'Guaranteed Renewability Option',
        },
    },
    {
        code: 'ergo',
        name: 'ERGO Insurance',
        tier: 'Smart Modular',
        rateMultiplier: 0.95,
        deductibleFactor: 1.0,
        commissionByLine: {
            [PolicyType.AUTO]: 0.16,
            [PolicyType.HOME]: 0.23,
            [PolicyType.HEALTH]: 0.17,
            [PolicyType.LIFE]: 0.25,
        },
        extraPerks: {
            [PolicyType.AUTO]: 'Natural Phenomena & Hail Protection',
            [PolicyType.HOME]: 'Solar Panel & Heat Pump Equipment Cover',
            [PolicyType.HEALTH]: 'Diagnostic Checkup €500/yr Included',
            [PolicyType.LIFE]: 'Accidental Double Indemnity',
        },
    },
    {
        code: 'allianz',
        name: 'Allianz Europe',
        tier: 'Global Premier',
        rateMultiplier: 1.12,
        deductibleFactor: 0.6,
        commissionByLine: {
            [PolicyType.AUTO]: 0.17,
            [PolicyType.HOME]: 0.24,
            [PolicyType.HEALTH]: 0.21,
            [PolicyType.LIFE]: 0.32,
        },
        extraPerks: {
            [PolicyType.AUTO]: 'Cross-Border Green Card + Zero Glass Deductible',
            [PolicyType.HOME]: 'All-Risk Fine Art & Valuables Extension',
            [PolicyType.HEALTH]: 'Worldwide Hospitalization €2,000,000',
            [PolicyType.LIFE]: 'Critical Illness Early Payout 50%',
        },
    },
];

export function generateComparativeQuotes(input: RatingInput): CarrierQuote[] {
    const age = Math.max(18, Math.min(85, input.driverOrInsuredAge ?? 38));
    const assetValue = Math.max(1000, input.assetValue || 15000);
    const includeCat = input.includeCatastrophePerils ?? true;

    let baseAnnualNet = 250;
    if (input.policyType === PolicyType.AUTO) {
        const ageFactor = age < 24 ? 1.35 : age > 70 ? 1.18 : 1.0;
        baseAnnualNet = (165 + assetValue * 0.0115) * ageFactor;
    } else if (input.policyType === PolicyType.HOME) {
        const sqm = input.squareMeters || Math.round(assetValue / 1200);
        const effectiveCapital = Math.max(assetValue, sqm * 1000);
        const catMultiplier = includeCat ? 1.28 : 0.82;
        baseAnnualNet = effectiveCapital * 0.00145 * catMultiplier;
    } else if (input.policyType === PolicyType.HEALTH) {
        const ageCurve = 1 + Math.max(0, age - 25) * 0.032;
        const classFactor = input.hospitalClass === 'Lux' ? 1.35 : input.hospitalClass === 'A' ? 1.15 : 0.92;
        baseAnnualNet = 680 * ageCurve * classFactor;
    } else if (input.policyType === PolicyType.LIFE) {
        const ageCurve = 1 + Math.max(0, age - 25) * 0.04;
        baseAnnualNet = (assetValue / 1000) * 1.95 * ageCurve;
    }

    const enfiaEligible =
        input.policyType === PolicyType.HOME &&
        includeCat &&
        (!input.squareMeters || assetValue >= input.squareMeters * 900);

    return CARRIERS.map((carrier, idx) => {
        const netPremium = Math.round(baseAnnualNet * carrier.rateMultiplier);
        // Include 15% insurance premium tax & policy fees
        const annualGrossPremium = Math.round(netPremium * 1.15);
        const monthlyEquivalent = Number((annualGrossPremium / 12).toFixed(2));
        const commissionRate = carrier.commissionByLine[input.policyType];
        const commissionEuro = Number((netPremium * commissionRate).toFixed(2));

        let deductibleEuro = 300;
        if (input.policyType === PolicyType.AUTO) deductibleEuro = Math.round(350 * carrier.deductibleFactor);
        if (input.policyType === PolicyType.HOME) deductibleEuro = Math.round(500 * carrier.deductibleFactor);
        if (input.policyType === PolicyType.HEALTH) deductibleEuro = Math.round(1000 * carrier.deductibleFactor);
        if (input.policyType === PolicyType.LIFE) deductibleEuro = 0;

        const deductible = deductibleEuro === 0 ? '€0 (None)' : `€${deductibleEuro.toLocaleString()}`;

        const coverages: Coverage[] = buildLineCoverages(
            input,
            assetValue,
            deductible,
            carrier.extraPerks[input.policyType],
            annualGrossPremium
        );

        const rawScore =
            92 -
            Math.round((carrier.rateMultiplier - 0.88) * 35) +
            Math.round((1.25 - carrier.deductibleFactor) * 18) +
            (enfiaEligible ? 4 : 0);
        const valueScore = Math.max(72, Math.min(99, rawScore));

        return {
            id: `quote_${carrier.code}_${idx}`,
            carrierName: carrier.name,
            tierLabel: carrier.tier,
            policyType: input.policyType,
            annualGrossPremium,
            monthlyEquivalent,
            netPremium,
            deductible,
            commissionRate,
            commissionEuro,
            enfiaTaxDiscountEligible: enfiaEligible,
            valueScore,
            coverages,
        };
    }).sort((a, b) => b.valueScore - a.valueScore);
}

function buildLineCoverages(
    input: RatingInput,
    assetValue: number,
    deductible: string,
    extraPerk: string,
    grossPremium: number
): Coverage[] {
    if (input.policyType === PolicyType.AUTO) {
        return [
            { type: 'Bodily Injury & Property Liability', limit: '€1,300,000 / claim', deductible: '€0', premium: Math.round(grossPremium * 0.55) },
            { type: 'Fire, Theft & Natural Phenomena', limit: `€${assetValue.toLocaleString()}`, deductible, premium: Math.round(grossPremium * 0.28) },
            { type: extraPerk, limit: 'Included', deductible: '€0', premium: Math.round(grossPremium * 0.17) },
        ];
    }
    if (input.policyType === PolicyType.HOME) {
        const list: Coverage[] = [
            { type: 'Fire, Lightning & Explosion (Building)', limit: `€${assetValue.toLocaleString()}`, deductible: '€0', premium: Math.round(grossPremium * 0.4) },
            { type: 'Theft, Pipe Burst & Third-Party Liability', limit: `€${Math.round(assetValue * 0.25).toLocaleString()}`, deductible: '€150', premium: Math.round(grossPremium * 0.2) },
        ];
        if (input.includeCatastrophePerils ?? true) {
            list.push({
                type: 'Earthquake & Weather Flood (ENFIA Eligible)',
                limit: `€${assetValue.toLocaleString()}`,
                deductible,
                premium: Math.round(grossPremium * 0.28),
            });
        }
        list.push({ type: extraPerk, limit: 'Included', deductible: '€0', premium: Math.round(grossPremium * 0.12) });
        return list;
    }
    if (input.policyType === PolicyType.HEALTH) {
        return [
            { type: `Inpatient Hospitalization (${input.hospitalClass || 'A'} Class)`, limit: '€1,000,000 / yr', deductible, premium: Math.round(grossPremium * 0.75) },
            { type: 'Outpatient Diagnostics & Emergency', limit: '€1,500 / yr', deductible: '15% Co-pay', premium: Math.round(grossPremium * 0.15) },
            { type: extraPerk, limit: 'Included', deductible: '€0', premium: Math.round(grossPremium * 0.1) },
        ];
    }
    return [
        { type: 'Term Life & Permanent Total Disability', limit: `€${assetValue.toLocaleString()}`, deductible: '€0', premium: Math.round(grossPremium * 0.85) },
        { type: extraPerk, limit: 'Included', deductible: '€0', premium: Math.round(grossPremium * 0.15) },
    ];
}

export function getQuickQuoteRange(input: RatingInput): {
    minMonthly: number;
    maxMonthly: number;
    recommendedAnnual: number;
    enfiaEligible: boolean;
} {
    const quotes = generateComparativeQuotes(input);
    const monthlies = quotes.map((q) => q.monthlyEquivalent);
    return {
        minMonthly: Math.min(...monthlies),
        maxMonthly: Math.max(...monthlies),
        recommendedAnnual: quotes[0]?.annualGrossPremium || 300,
        enfiaEligible: Boolean(quotes[0]?.enfiaTaxDiscountEligible),
    };
}
