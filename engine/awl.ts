import { Fraction, sumFractions } from './Fraction';
import type { HeirShare } from './types';

/**
 * AWL (عول) — shares exceed 1.
 * Replace each heir's fraction denominator with the sum's numerator.
 */
export function applyAwl(shares: HeirShare[]): { shares: HeirShare[]; awlDenominator: number } {
  const active = shares.filter(s => !s.isBlocked && !s.totalFraction.isZero());
  const total = sumFractions(active.map(s => s.totalFraction));

  // Find common denominator
  let cd = 1;
  for (const s of active) {
    cd = (cd * s.totalFraction.denominator) / Fraction.gcd(cd, s.totalFraction.denominator);
  }

  // Express each as numerator over cd
  const awlDenominator = active.reduce((sum, s) => sum + s.totalFraction.toCommonDenominator(cd), 0);

  const result = shares.map(s => {
    if (s.isBlocked || s.totalFraction.isZero()) return s;
    const newNum = s.totalFraction.toCommonDenominator(cd);
    const newFraction = new Fraction(newNum, awlDenominator);
    const perPerson = s.count > 0 ? newFraction.divide(Fraction.fromNumber(s.count)) : Fraction.ZERO;
    return { ...s, totalFraction: newFraction, perPersonFraction: perPerson };
  });

  return { shares: result, awlDenominator };
}
