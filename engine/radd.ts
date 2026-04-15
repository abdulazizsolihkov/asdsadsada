import { Fraction, sumFractions } from './Fraction';
import type { HeirShare } from './types';

const SPOUSE_TYPES = new Set(['husband', 'wife']);

/**
 * RADD (رد) — shares are less than 1.
 * Spouse keeps exact share; remainder redistributed among non-spouse heirs proportionally.
 * If no spouse, all heirs share proportionally.
 */
export function applyRadd(shares: HeirShare[]): HeirShare[] {
  const active = shares.filter(s => !s.isBlocked && !s.totalFraction.isZero());
  const spouseShares = active.filter(s => SPOUSE_TYPES.has(s.heirType));
  const nonSpouseShares = active.filter(s => !SPOUSE_TYPES.has(s.heirType));

  if (nonSpouseShares.length === 0) {
    // Only spouse; remainder goes to Bayt al-Mal — no Radd
    return shares;
  }

  const spouseTotal = sumFractions(spouseShares.map(s => s.totalFraction));
  const remainder = Fraction.ONE.subtract(spouseTotal); // what's left for non-spouse heirs

  // Find common denominator for non-spouse shares
  let cd = 1;
  for (const s of nonSpouseShares) {
    cd = (cd * s.totalFraction.denominator) / Fraction.gcd(cd, s.totalFraction.denominator);
  }

  const nonSpouseNumeratorSum = nonSpouseShares.reduce(
    (sum, s) => sum + s.totalFraction.toCommonDenominator(cd),
    0,
  );

  // New denominator for proportional redistribution = nonSpouseNumeratorSum
  return shares.map(s => {
    if (s.isBlocked) return s;
    if (SPOUSE_TYPES.has(s.heirType)) return s; // spouse unchanged
    if (s.totalFraction.isZero()) return s;

    const numeratorInCd = s.totalFraction.toCommonDenominator(cd);
    // Proportion of non-spouse remainder: (numeratorInCd / nonSpouseNumeratorSum) * remainder
    const proportion = new Fraction(numeratorInCd, nonSpouseNumeratorSum);
    const newFraction = proportion.multiply(remainder);
    const perPerson = s.count > 0 ? newFraction.divide(Fraction.fromNumber(s.count)) : Fraction.ZERO;
    return { ...s, totalFraction: newFraction, perPersonFraction: perPerson };
  });
}
