import { Fraction } from './Fraction';
import type { HeirData, HeirShare, HeirType } from './types';

type ShareMap = Map<HeirType, HeirShare>;

function makeShare(
  heirType: HeirType,
  count: number,
  totalFraction: Fraction,
  method: HeirShare['method'],
  ruleApplied: string,
): HeirShare {
  const perPersonFraction =
    count > 0 && !totalFraction.isZero()
      ? totalFraction.divide(Fraction.fromNumber(count))
      : Fraction.ZERO;
  return {
    heirType,
    count,
    totalFraction,
    perPersonFraction,
    method,
    ruleApplied,
    isBlocked: method === 'blocked',
    blockReason: method === 'blocked' ? ruleApplied : undefined,
  };
}

function hasAnyMaleLine(h: HeirData): boolean {
  return (
    h.son_count > 0 ||
    h.sons_son_count > 0 ||
    h.sons_sons_son_count > 0
  );
}

function hasAnyChildren(h: HeirData): boolean {
  return (
    h.son_count > 0 ||
    h.daughter_count > 0 ||
    h.sons_son_count > 0 ||
    h.sons_daughter_count > 0 ||
    h.sons_sons_son_count > 0 ||
    h.sons_sons_daughter_count > 0
  );
}

function hasAnyFatherFigure(h: HeirData): boolean {
  return h.father_alive || h.fathers_father_alive || h.fathers_fathers_father_alive;
}

function totalSiblings(h: HeirData): number {
  return h.blood_brother_count + h.blood_sister_count + h.paternal_brother_count + h.paternal_sister_count;
}

// ─── 5.1.1 Son ───────────────────────────────────────────────────────────────
export function evaluateSon(h: HeirData, shares: ShareMap): void {
  if (h.son_count === 0) return;
  // Sons (with or without daughters) are always ASABA
  shares.set('son', makeShare('son', h.son_count, Fraction.ZERO, 'asaba', 'Son: Asaba (residuary)'));
}

// ─── 5.1.1 Daughter ──────────────────────────────────────────────────────────
export function evaluateDaughter(h: HeirData, shares: ShareMap): void {
  if (h.daughter_count === 0) return;

  if (h.son_count > 0) {
    // Daughters share Asaba with sons at 2:1
    shares.set('daughter', makeShare('daughter', h.daughter_count, Fraction.ZERO, 'asaba', 'Daughter: Asaba with sons (2:1 ratio)'));
    return;
  }

  if (h.daughter_count === 1) {
    shares.set('daughter', makeShare('daughter', 1, new Fraction(1, 2), 'fard', 'Daughter: 1 daughter, no sons → 1/2'));
  } else {
    shares.set('daughter', makeShare('daughter', h.daughter_count, new Fraction(2, 3), 'fard', 'Daughters: ≥2 daughters, no sons → 2/3 shared'));
  }
}

// ─── 5.1.2 Son's Son ─────────────────────────────────────────────────────────
export function evaluateSonsSon(h: HeirData, shares: ShareMap): void {
  if (h.sons_son_count === 0 || h.son_count > 0) return;
  shares.set('sons_son', makeShare('sons_son', h.sons_son_count, Fraction.ZERO, 'asaba', "Son's son: Asaba (residuary)"));
}

// ─── 5.1.2 Son's Daughter ────────────────────────────────────────────────────
export function evaluateSonsDaughter(h: HeirData, shares: ShareMap): void {
  if (h.sons_daughter_count === 0) return;
  if (h.son_count > 0) {
    // Blocked by son
    shares.set('sons_daughter', makeShare('sons_daughter', h.sons_daughter_count, Fraction.ZERO, 'blocked', "Blocked by son"));
    return;
  }

  if (h.sons_son_count > 0) {
    // Asaba with son's son at 2:1
    shares.set('sons_daughter', makeShare('sons_daughter', h.sons_daughter_count, Fraction.ZERO, 'asaba', "Son's daughter: Asaba with son's son (2:1 ratio)"));
    return;
  }

  // No sons, no son's son
  if (h.daughter_count === 0 && h.sons_daughter_count === 1) {
    shares.set('sons_daughter', makeShare('sons_daughter', 1, new Fraction(1, 2), 'fard', "Son's daughter: 1, no sons/daughters → 1/2"));
    return;
  }
  if (h.daughter_count === 0 && h.sons_daughter_count >= 2) {
    shares.set('sons_daughter', makeShare('sons_daughter', h.sons_daughter_count, new Fraction(2, 3), 'fard', "Son's daughters: ≥2, no sons/daughters → 2/3 shared"));
    return;
  }
  if (h.daughter_count === 1) {
    shares.set('sons_daughter', makeShare('sons_daughter', h.sons_daughter_count, new Fraction(1, 6), 'fard', "Son's daughter: 1 daughter present → 1/6"));
    return;
  }
  if (h.daughter_count >= 2) {
    shares.set('sons_daughter', makeShare('sons_daughter', h.sons_daughter_count, Fraction.ZERO, 'blocked', "Son's daughter: blocked (≥2 daughters, total daughters ≥ 2/3)"));
    return;
  }
}

// ─── 5.1.3 Son's Son's Son ───────────────────────────────────────────────────
export function evaluateSonsSonsSon(h: HeirData, shares: ShareMap): void {
  if (h.sons_sons_son_count === 0) return;
  if (h.son_count > 0 || h.sons_son_count > 0) return; // blocked by higher male line
  shares.set('sons_sons_son', makeShare('sons_sons_son', h.sons_sons_son_count, Fraction.ZERO, 'asaba', "Son's son's son: Asaba"));
}

// ─── 5.1.3 Son's Son's Daughter ──────────────────────────────────────────────
export function evaluateSonsSonsDaughter(h: HeirData, shares: ShareMap): void {
  if (h.sons_sons_daughter_count === 0) return;
  if (h.son_count > 0 || h.sons_son_count > 0) {
    shares.set('sons_sons_daughter', makeShare('sons_sons_daughter', h.sons_sons_daughter_count, Fraction.ZERO, 'blocked', "Blocked by son or son's son"));
    return;
  }
  if (h.sons_sons_son_count > 0) {
    shares.set('sons_sons_daughter', makeShare('sons_sons_daughter', h.sons_sons_daughter_count, Fraction.ZERO, 'asaba', "Son's son's daughter: Asaba with son's son's son (2:1)"));
    return;
  }
  // No male line at all
  const totalDaughterTypes = h.daughter_count + h.sons_daughter_count;
  if (h.daughter_count === 0 && h.sons_daughter_count === 0 && h.sons_sons_daughter_count === 1) {
    shares.set('sons_sons_daughter', makeShare('sons_sons_daughter', 1, new Fraction(1, 2), 'fard', "Son's son's daughter: alone → 1/2"));
    return;
  }
  if (h.daughter_count === 0 && h.sons_daughter_count === 0 && h.sons_sons_daughter_count >= 2) {
    shares.set('sons_sons_daughter', makeShare('sons_sons_daughter', h.sons_sons_daughter_count, new Fraction(2, 3), 'fard', "Son's son's daughters: ≥2 → 2/3 shared"));
    return;
  }
  if (totalDaughterTypes === 1) {
    shares.set('sons_sons_daughter', makeShare('sons_sons_daughter', h.sons_sons_daughter_count, new Fraction(1, 6), 'fard', "Son's son's daughter: one daughter-type above → 1/6"));
    return;
  }
  if (totalDaughterTypes >= 2) {
    shares.set('sons_sons_daughter', makeShare('sons_sons_daughter', h.sons_sons_daughter_count, Fraction.ZERO, 'blocked', "Son's son's daughter: blocked (daughter-types ≥ 2/3 already)"));
    return;
  }
}

// ─── 5.1.4 Husband ───────────────────────────────────────────────────────────
export function evaluateHusband(h: HeirData, shares: ShareMap): void {
  if (!h.husband_alive) return;
  if (!hasAnyChildren(h)) {
    shares.set('husband', makeShare('husband', 1, new Fraction(1, 2), 'fard', 'Husband: no children → 1/2'));
  } else {
    shares.set('husband', makeShare('husband', 1, new Fraction(1, 4), 'fard', 'Husband: children exist → 1/4'));
  }
}

// ─── 5.1.5 Wife ──────────────────────────────────────────────────────────────
export function evaluateWife(h: HeirData, shares: ShareMap): void {
  if (h.wife_count === 0) return;
  const fraction = hasAnyChildren(h) ? new Fraction(1, 8) : new Fraction(1, 4);
  const rule = hasAnyChildren(h)
    ? `Wife: children exist → 1/8 (shared among ${h.wife_count})`
    : `Wife: no children → 1/4 (shared among ${h.wife_count})`;
  shares.set('wife', makeShare('wife', h.wife_count, fraction, 'fard', rule));
}

// ─── 5.1.6 Father ────────────────────────────────────────────────────────────
export function evaluateFather(h: HeirData, shares: ShareMap): void {
  if (!h.father_alive) return;

  // Special Gharrawain cases
  const noChildren = !hasAnyChildren(h);

  if (h.husband_alive && h.mother_alive && noChildren) {
    // Gharrawain with husband: father gets 1/3 of remainder after husband's share
    // husband = 1/2, mother = 1/6 (1/3 of remainder 1/2), father = remainder
    shares.set('father', makeShare('father', 1, Fraction.ZERO, 'asaba', 'Father: Gharrawain (husband+father+mother) → remainder after husband/mother'));
    return;
  }
  if (h.wife_count > 0 && h.mother_alive && noChildren && totalSiblings(h) < 2) {
    // Gharrawain with wife: father gets 1/2 of remainder after wife
    shares.set('father', makeShare('father', 1, Fraction.ZERO, 'asaba', 'Father: Gharrawain (wife+father+mother) → remainder after wife/mother'));
    return;
  }

  if (hasAnyMaleLine(h)) {
    shares.set('father', makeShare('father', 1, new Fraction(1, 6), 'fard', 'Father: male descendants exist → 1/6'));
    return;
  }
  if (hasAnyChildren(h)) {
    // Any daughter-type but no male line: 1/6 + asaba
    shares.set('father', makeShare('father', 1, new Fraction(1, 6), 'fard_plus_asaba', 'Father: daughter(s) only → 1/6 + remainder (Asaba)'));
    return;
  }
  // No children at all
  shares.set('father', makeShare('father', 1, Fraction.ZERO, 'asaba', 'Father: no children → Asaba (all remainder)'));
}

// ─── 5.1.7 Mother ────────────────────────────────────────────────────────────
export function evaluateMother(h: HeirData, shares: ShareMap): void {
  if (!h.mother_alive) return;
  const noChildren = !hasAnyChildren(h);

  if (h.husband_alive && h.father_alive && noChildren) {
    // Gharrawain with husband: mother gets 1/3 of what remains after husband
    // After husband (1/2) → remaining = 1/2. Mother gets 1/3 of 1/2 = 1/6
    shares.set('mother', makeShare('mother', 1, new Fraction(1, 6), 'fard', 'Mother: Gharrawain (husband+father+mother) → 1/6'));
    return;
  }
  if (h.wife_count > 0 && h.father_alive && noChildren && totalSiblings(h) < 2) {
    // Gharrawain with wife: mother gets 1/4 of remainder after wife
    // After wife (1/4) → remaining = 3/4. Mother gets 1/3 of 3/4 = 1/4
    shares.set('mother', makeShare('mother', 1, new Fraction(1, 4), 'fard', 'Mother: Gharrawain (wife+father+mother) → 1/4 of remainder'));
    return;
  }

  if (hasAnyChildren(h) || totalSiblings(h) >= 2) {
    shares.set('mother', makeShare('mother', 1, new Fraction(1, 6), 'fard', 'Mother: children or ≥2 siblings → 1/6'));
    return;
  }
  shares.set('mother', makeShare('mother', 1, new Fraction(1, 3), 'fard', 'Mother: no children, < 2 siblings → 1/3'));
}

// ─── 5.1.8 Father's Father ───────────────────────────────────────────────────
export function evaluateFathersfather(h: HeirData, shares: ShareMap): void {
  if (!h.fathers_father_alive || h.father_alive) return;

  if (hasAnyMaleLine(h)) {
    shares.set('fathers_father', makeShare('fathers_father', 1, new Fraction(1, 6), 'fard', "Father's father: male line exists → 1/6"));
    return;
  }
  if (hasAnyChildren(h)) {
    shares.set('fathers_father', makeShare('fathers_father', 1, new Fraction(1, 6), 'fard_plus_asaba', "Father's father: daughters only → 1/6 + remainder"));
    return;
  }
  shares.set('fathers_father', makeShare('fathers_father', 1, Fraction.ZERO, 'asaba', "Father's father: no children → Asaba"));
}

// ─── 5.1.9 Father's Father's Father ─────────────────────────────────────────
export function evaluateFatherssFathersfather(h: HeirData, shares: ShareMap): void {
  if (!h.fathers_fathers_father_alive || h.father_alive || h.fathers_father_alive) return;

  if (hasAnyMaleLine(h)) {
    shares.set('fathers_fathers_father', makeShare('fathers_fathers_father', 1, new Fraction(1, 6), 'fard', "Father's father's father: male line exists → 1/6"));
    return;
  }
  if (hasAnyChildren(h)) {
    shares.set('fathers_fathers_father', makeShare('fathers_fathers_father', 1, new Fraction(1, 6), 'fard_plus_asaba', "Father's father's father: daughters only → 1/6 + remainder"));
    return;
  }
  shares.set('fathers_fathers_father', makeShare('fathers_fathers_father', 1, Fraction.ZERO, 'asaba', "Father's father's father: no children → Asaba"));
}

// ─── 5.1.10 Grandmothers ─────────────────────────────────────────────────────
export function evaluateGrandmothers(h: HeirData, shares: ShareMap): void {
  // Mother blocks all grandmothers
  if (h.mother_alive) return;

  const living: HeirType[] = [];
  if (h.mothers_mother_alive) living.push('mothers_mother');
  if (h.fathers_mother_alive) living.push('fathers_mother');

  if (living.length > 0) {
    // They share 1/6 equally
    const total = new Fraction(1, 6);
    for (const t of living) {
      shares.set(t, makeShare(t, 1, total.divide(Fraction.fromNumber(living.length)), 'fard', `Grandmother (${t}): shares 1/6 with ${living.length} grandmother(s)`));
    }
    return;
  }

  // Great-grandmothers
  const greatLiving: HeirType[] = [];
  if (h.mothers_mothers_mother_alive) greatLiving.push('mothers_mothers_mother');
  if (h.fathers_fathers_mother_alive) greatLiving.push('fathers_fathers_mother');
  if (h.fathers_mothers_mother_alive) greatLiving.push('fathers_mothers_mother');

  if (greatLiving.length > 0) {
    const total = new Fraction(1, 6);
    for (const t of greatLiving) {
      shares.set(t, makeShare(t, 1, total.divide(Fraction.fromNumber(greatLiving.length)), 'fard', `Great-grandmother (${t}): shares 1/6`));
    }
  }
}

// ─── 5.1.11 Blood Sister ─────────────────────────────────────────────────────
export function evaluateBloodSister(h: HeirData, shares: ShareMap): void {
  if (h.blood_sister_count === 0) return;

  // Blocked by son/father/grandfather
  if (hasAnyMaleLine(h) || h.father_alive || h.fathers_father_alive || h.fathers_fathers_father_alive) {
    shares.set('blood_sister', makeShare('blood_sister', h.blood_sister_count, Fraction.ZERO, 'blocked', 'Blood sister: blocked by son or father-figure'));
    return;
  }

  if (h.blood_brother_count > 0) {
    // Asaba with blood brothers at 2:1
    shares.set('blood_sister', makeShare('blood_sister', h.blood_sister_count, Fraction.ZERO, 'asaba', 'Blood sister: Asaba with blood brother (2:1)'));
    return;
  }

  // No blood brothers
  if (hasAnyChildren(h)) {
    // With daughters (no sons) → asaba with sisters
    shares.set('blood_sister', makeShare('blood_sister', h.blood_sister_count, Fraction.ZERO, 'asaba', 'Blood sister: Asaba (with daughters, no sons/father)'));
    return;
  }

  if (h.blood_sister_count === 1) {
    shares.set('blood_sister', makeShare('blood_sister', 1, new Fraction(1, 2), 'fard', 'Blood sister: 1 sister, no brothers → 1/2'));
    return;
  }
  shares.set('blood_sister', makeShare('blood_sister', h.blood_sister_count, new Fraction(2, 3), 'fard', 'Blood sisters: ≥2, no brothers → 2/3 shared'));
}

// ─── 5.1.11 Blood Brother ────────────────────────────────────────────────────
export function evaluateBloodBrother(h: HeirData, shares: ShareMap): void {
  if (h.blood_brother_count === 0) return;

  if (hasAnyMaleLine(h) || h.father_alive || h.fathers_father_alive || h.fathers_fathers_father_alive) {
    shares.set('blood_brother', makeShare('blood_brother', h.blood_brother_count, Fraction.ZERO, 'blocked', 'Blood brother: blocked by son or father-figure'));
    return;
  }
  shares.set('blood_brother', makeShare('blood_brother', h.blood_brother_count, Fraction.ZERO, 'asaba', 'Blood brother: Asaba (residuary)'));
}

// ─── 5.1.12 Paternal Sister ──────────────────────────────────────────────────
export function evaluatePaternalSister(h: HeirData, shares: ShareMap): void {
  if (h.paternal_sister_count === 0) return;

  // Blocked by: any son-type, any father-figure, blood brother, or ≥2 blood sisters
  if (hasAnyMaleLine(h) || hasAnyFatherFigure(h) || h.blood_brother_count > 0) {
    shares.set('paternal_sister', makeShare('paternal_sister', h.paternal_sister_count, Fraction.ZERO, 'blocked', 'Paternal sister: blocked by son/father/blood-brother'));
    return;
  }
  if (h.blood_sister_count >= 2) {
    shares.set('paternal_sister', makeShare('paternal_sister', h.paternal_sister_count, Fraction.ZERO, 'blocked', 'Paternal sister: blocked by ≥2 blood sisters'));
    return;
  }

  if (h.paternal_brother_count > 0) {
    // Asaba with paternal brothers at 2:1
    shares.set('paternal_sister', makeShare('paternal_sister', h.paternal_sister_count, Fraction.ZERO, 'asaba', 'Paternal sister: Asaba with paternal brother (2:1)'));
    return;
  }

  if (hasAnyChildren(h)) {
    // With daughters, no male line → asaba
    shares.set('paternal_sister', makeShare('paternal_sister', h.paternal_sister_count, Fraction.ZERO, 'asaba', 'Paternal sister: Asaba with daughters'));
    return;
  }

  if (h.blood_sister_count === 1) {
    // Gets 1/6 supplement
    shares.set('paternal_sister', makeShare('paternal_sister', h.paternal_sister_count, new Fraction(1, 6), 'fard', 'Paternal sister: 1 blood sister → 1/6 supplement'));
    return;
  }

  if (h.paternal_sister_count === 1) {
    shares.set('paternal_sister', makeShare('paternal_sister', 1, new Fraction(1, 2), 'fard', 'Paternal sister: 1, no blocking → 1/2'));
    return;
  }
  shares.set('paternal_sister', makeShare('paternal_sister', h.paternal_sister_count, new Fraction(2, 3), 'fard', 'Paternal sisters: ≥2 → 2/3 shared'));
}

// ─── 5.1.12 Paternal Brother ─────────────────────────────────────────────────
export function evaluatePaternalBrother(h: HeirData, shares: ShareMap): void {
  if (h.paternal_brother_count === 0) return;

  if (hasAnyMaleLine(h) || hasAnyFatherFigure(h) || h.blood_brother_count > 0) {
    shares.set('paternal_brother', makeShare('paternal_brother', h.paternal_brother_count, Fraction.ZERO, 'blocked', 'Paternal brother: blocked'));
    return;
  }
  shares.set('paternal_brother', makeShare('paternal_brother', h.paternal_brother_count, Fraction.ZERO, 'asaba', 'Paternal brother: Asaba'));
}

// ─── 5.1.13 Maternal Siblings ────────────────────────────────────────────────
export function evaluateMaternalSiblings(h: HeirData, shares: ShareMap): void {
  const total = h.maternal_brother_count + h.maternal_sister_count;
  if (total === 0) return;

  // Blocked by sons/daughters or father-figure
  if (hasAnyChildren(h) || hasAnyFatherFigure(h)) {
    if (h.maternal_brother_count > 0) {
      shares.set('maternal_brother', makeShare('maternal_brother', h.maternal_brother_count, Fraction.ZERO, 'blocked', 'Maternal brother: blocked by children or father'));
    }
    if (h.maternal_sister_count > 0) {
      shares.set('maternal_sister', makeShare('maternal_sister', h.maternal_sister_count, Fraction.ZERO, 'blocked', 'Maternal sister: blocked by children or father'));
    }
    return;
  }

  const share = total === 1 ? new Fraction(1, 6) : new Fraction(1, 3);
  const rule = total === 1 ? '1/6' : '1/3 shared equally';

  if (h.maternal_brother_count > 0) {
    shares.set('maternal_brother', makeShare('maternal_brother', h.maternal_brother_count,
      share.multiply(Fraction.fromNumber(h.maternal_brother_count)).divide(Fraction.fromNumber(total)),
      'fard', `Maternal brother: ${rule}`));
  }
  if (h.maternal_sister_count > 0) {
    shares.set('maternal_sister', makeShare('maternal_sister', h.maternal_sister_count,
      share.multiply(Fraction.fromNumber(h.maternal_sister_count)).divide(Fraction.fromNumber(total)),
      'fard', `Maternal sister: ${rule}`));
  }
}

// ─── Asaba chain (Steps 6–11) ─────────────────────────────────────────────────
export function evaluateAsabaChain(h: HeirData, shares: ShareMap): void {
  // Only runs if all primary Asaba men are absent
  const triggered =
    h.son_count === 0 &&
    h.sons_son_count === 0 &&
    h.sons_sons_son_count === 0 &&
    !h.father_alive &&
    !h.fathers_father_alive &&
    !h.fathers_fathers_father_alive &&
    h.blood_brother_count === 0 &&
    h.paternal_brother_count === 0;

  if (!triggered) return;

  const chain: Array<{ key: keyof HeirData; type: HeirType; label: string }> = [
    { key: 'blood_brothers_son_count', type: 'blood_brothers_son', label: "Blood brother's son" },
    { key: 'paternal_brothers_son_count', type: 'paternal_brothers_son', label: "Paternal brother's son" },
    { key: 'blood_uncle_count', type: 'blood_uncle', label: 'Blood uncle' },
    { key: 'paternal_uncle_count', type: 'paternal_uncle', label: 'Paternal uncle' },
    { key: 'blood_uncles_son_count', type: 'blood_uncles_son', label: "Blood uncle's son" },
    { key: 'paternal_uncles_son_count', type: 'paternal_uncles_son', label: "Paternal uncle's son" },
  ];

  for (const item of chain) {
    const count = h[item.key] as number;
    if (count > 0) {
      shares.set(item.type, makeShare(item.type, count, Fraction.ZERO, 'asaba', `${item.label}: Asaba (chain heir)`));
      break; // stop at first found
    }
  }
}
