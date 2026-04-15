import { Fraction, sumFractions } from './Fraction';
import type { EstateInput, HeirData, HeirShare, HeirType, CalculationResult } from './types';
import {
  evaluateSon,
  evaluateDaughter,
  evaluateSonsSon,
  evaluateSonsDaughter,
  evaluateSonsSonsSon,
  evaluateSonsSonsDaughter,
  evaluateHusband,
  evaluateWife,
  evaluateFather,
  evaluateMother,
  evaluateFathersfather,
  evaluateFatherssFathersfather,
  evaluateGrandmothers,
  evaluateBloodBrother,
  evaluateBloodSister,
  evaluatePaternalBrother,
  evaluatePaternalSister,
  evaluateMaternalSiblings,
  evaluateAsabaChain,
} from './rules';
import { applyAwl } from './awl';
import { applyRadd } from './radd';

// ─── Estate calculation ───────────────────────────────────────────────────────
export function computeEstate(input: EstateInput): {
  grossAmount: number;
  burialExpenses: number;
  debtsTopeople: number;
  religiousDebts: number;
  netAmount: number;
  bequest: number;
  bequestCapped: boolean;
  finalAmount: number;
} {
  let grossAmount: number;
  let burialExpenses: number;

  if (input.mode === 'advanced') {
    grossAmount =
      input.cash +
      input.assets +
      input.livestock +
      input.gold_silver +
      input.given_debts +
      input.investments +
      input.business_capital;
    burialExpenses = input.shroud + input.funeral_expenses;
  } else {
    grossAmount = input.gross_amount;
    burialExpenses = input.burial_expenses;
  }

  const debtsTopeople = input.debts_to_people;
  const religiousDebts = input.religious_debts;

  const netAmount = Math.max(0, grossAmount - burialExpenses - debtsTopeople - religiousDebts);
  const maxBequest = Math.floor(netAmount / 3);
  const bequestCapped = input.bequest > maxBequest;
  const bequest = bequestCapped ? maxBequest : Math.max(0, input.bequest);
  const finalAmount = Math.max(0, netAmount - bequest);

  return { grossAmount, burialExpenses, debtsTopeople, religiousDebts, netAmount, bequest, bequestCapped, finalAmount };
}

// ─── ASABA distribution ───────────────────────────────────────────────────────
const MALE_ASABA_TYPES = new Set<HeirType>([
  'son', 'sons_son', 'sons_sons_son',
  'father', 'fathers_father', 'fathers_fathers_father',
  'blood_brother', 'paternal_brother',
  'blood_brothers_son', 'paternal_brothers_son',
  'blood_uncle', 'paternal_uncle',
  'blood_uncles_son', 'paternal_uncles_son',
]);

const FEMALE_ASABA_TYPES = new Set<HeirType>([
  'daughter', 'sons_daughter', 'sons_sons_daughter',
  'blood_sister', 'paternal_sister',
]);

function distributeAsaba(shares: Map<HeirType, HeirShare>, remainder: Fraction, heirs: HeirData): Map<HeirType, HeirShare> {
  const asabaMales = [...shares.values()].filter(s => s.method === 'asaba' && MALE_ASABA_TYPES.has(s.heirType));
  const asabaFemales = [...shares.values()].filter(s => s.method === 'asaba' && FEMALE_ASABA_TYPES.has(s.heirType));
  const otherAsaba = [...shares.values()].filter(
    s => s.method === 'asaba' && !MALE_ASABA_TYPES.has(s.heirType) && !FEMALE_ASABA_TYPES.has(s.heirType),
  );

  if (remainder.isZero() || remainder.isLessThan(0)) {
    // Nothing to distribute
    for (const s of [...asabaMales, ...asabaFemales, ...otherAsaba]) {
      shares.set(s.heirType, { ...s, totalFraction: Fraction.ZERO, perPersonFraction: Fraction.ZERO });
    }
    return shares;
  }

  // Determine total Asaba units (males = 2, females = 1)
  let totalUnits = 0;
  for (const s of asabaMales) totalUnits += s.count * 2;
  for (const s of asabaFemales) totalUnits += s.count * 1;
  for (const s of otherAsaba) totalUnits += s.count * 1;

  if (totalUnits === 0) return shares;

  const unitShare = remainder.divide(Fraction.fromNumber(totalUnits));

  for (const s of asabaMales) {
    const total = unitShare.multiply(Fraction.fromNumber(s.count * 2));
    const perPerson = unitShare.multiply(Fraction.fromNumber(2));
    shares.set(s.heirType, { ...s, totalFraction: total, perPersonFraction: perPerson });
  }
  for (const s of asabaFemales) {
    const total = unitShare.multiply(Fraction.fromNumber(s.count));
    const perPerson = unitShare;
    shares.set(s.heirType, { ...s, totalFraction: total, perPersonFraction: perPerson });
  }
  for (const s of otherAsaba) {
    const total = unitShare.multiply(Fraction.fromNumber(s.count));
    const perPerson = unitShare;
    shares.set(s.heirType, { ...s, totalFraction: total, perPersonFraction: perPerson });
  }

  return shares;
}

// Handle Gharrawain specially
function applyGharrawain(shares: Map<HeirType, HeirShare>, heirs: HeirData): void {
  const fatherShare = shares.get('father');
  const motherShare = shares.get('mother');

  if (!fatherShare || !motherShare) return;
  if (fatherShare.method !== 'asaba') return;

  if (heirs.husband_alive) {
    // husband=1/2, mother=1/6, father=remainder after both
    const husbandFrac = new Fraction(1, 2);
    const motherFrac = new Fraction(1, 6);
    const fatherFrac = Fraction.ONE.subtract(husbandFrac).subtract(motherFrac);
    const f = { ...fatherShare, totalFraction: fatherFrac, perPersonFraction: fatherFrac, method: 'asaba' as const };
    shares.set('father', f);
  } else if (heirs.wife_count > 0) {
    // wife=1/4, mother=1/4 of remainder(3/4)=3/16... wait:
    // Actually per PRD §5.1.7 rule 4: mother gets 1/4 of remainder after wife
    // remainder after wife (1/4) = 3/4. Mother = 1/3 of 3/4 = 1/4. Father = 3/4 - 1/4 = 1/2
    const wifeFrac = new Fraction(1, 4);
    const remaining = Fraction.ONE.subtract(wifeFrac); // 3/4
    // mother = 1/3 of remaining
    const motherNewFrac = remaining.divide(Fraction.fromNumber(3));
    const fatherFrac = remaining.subtract(motherNewFrac);
    shares.set('mother', { ...motherShare, totalFraction: motherNewFrac, perPersonFraction: motherNewFrac });
    shares.set('father', { ...fatherShare, totalFraction: fatherFrac, perPersonFraction: fatherFrac, method: 'asaba' as const });
  }
}

// ─── Main calculator ──────────────────────────────────────────────────────────
export function calculateInheritance(estate: EstateInput, heirs: HeirData): CalculationResult {
  const estateData = computeEstate(estate);

  // Build share map
  const shareMap = new Map<HeirType, HeirShare>();

  evaluateSon(heirs, shareMap);
  evaluateDaughter(heirs, shareMap);
  evaluateSonsSon(heirs, shareMap);
  evaluateSonsDaughter(heirs, shareMap);
  evaluateSonsSonsSon(heirs, shareMap);
  evaluateSonsSonsDaughter(heirs, shareMap);
  evaluateHusband(heirs, shareMap);
  evaluateWife(heirs, shareMap);
  evaluateFather(heirs, shareMap);
  evaluateMother(heirs, shareMap);
  evaluateFathersfather(heirs, shareMap);
  evaluateFatherssFathersfather(heirs, shareMap);
  evaluateGrandmothers(heirs, shareMap);
  evaluateBloodBrother(heirs, shareMap);
  evaluateBloodSister(heirs, shareMap);
  evaluatePaternalBrother(heirs, shareMap);
  evaluatePaternalSister(heirs, shareMap);
  evaluateMaternalSiblings(heirs, shareMap);
  evaluateAsabaChain(heirs, shareMap);

  // Handle Gharrawain
  applyGharrawain(shareMap, heirs);

  // Sum Fard shares (non-asaba, non-blocked)
  const fardShares = [...shareMap.values()].filter(
    s => !s.isBlocked && (s.method === 'fard' || s.method === 'fard_plus_asaba'),
  );
  const fardSum = sumFractions(fardShares.map(s => s.totalFraction));
  const remainder = Fraction.ONE.subtract(fardSum);

  // Distribute Asaba
  distributeAsaba(shareMap, remainder, heirs);

  // After Asaba distribution, recalculate total
  const allActive = [...shareMap.values()].filter(s => !s.isBlocked);
  const totalSum = sumFractions(allActive.map(s => s.totalFraction));

  let finalShares = [...shareMap.values()];
  let method: CalculationResult['method'] = 'exact';
  let awlDenominator: number | undefined;
  let raddNotes: string | undefined;

  const epsilon = new Fraction(1, 1_000_000);

  if (totalSum.isGreaterThan(Fraction.ONE.add(epsilon))) {
    const result = applyAwl(finalShares);
    finalShares = result.shares;
    method = 'awl';
    awlDenominator = result.awlDenominator;
  } else if (totalSum.isLessThan(Fraction.ONE.subtract(epsilon))) {
    finalShares = applyRadd(finalShares);
    method = 'radd';
    raddNotes = 'Remaining estate redistributed proportionally among non-spouse heirs (Radd).';
  }

  return {
    ...estateData,
    shares: finalShares,
    method,
    awlDenominator,
    raddNotes,
  };
}
