export interface EstateInput {
  mode: 'basic' | 'advanced';

  // Basic mode fields
  gross_amount: number;
  burial_expenses: number;
  debts_to_people: number;
  religious_debts: number;
  bequest: number;

  // Advanced mode — asset breakdown
  cash: number;
  assets: number;
  livestock: number;
  gold_silver: number;
  given_debts: number;
  investments: number;
  business_capital: number;

  // Advanced mode — burial breakdown
  shroud: number;
  funeral_expenses: number;
}

export interface HeirData {
  // Step 1
  deceased_gender: 'male' | 'female';

  // Step 2
  wife_count: number;
  husband_alive: boolean;

  // Step 3
  son_count: number;
  daughter_count: number;
  sons_son_count: number;
  sons_daughter_count: number;
  sons_sons_son_count: number;
  sons_sons_daughter_count: number;

  // Step 4 — Parents
  father_alive: boolean;
  mother_alive: boolean;

  // Grandfathers
  fathers_father_alive: boolean;
  fathers_fathers_father_alive: boolean;

  // Grandmothers
  mothers_mother_alive: boolean;
  fathers_mother_alive: boolean;
  mothers_mothers_mother_alive: boolean;
  fathers_fathers_mother_alive: boolean;
  fathers_mothers_mother_alive: boolean;

  // Siblings
  blood_brother_count: number;
  blood_sister_count: number;
  paternal_brother_count: number;
  paternal_sister_count: number;
  maternal_brother_count: number;
  maternal_sister_count: number;

  // Asaba chain
  blood_brothers_son_count: number;
  paternal_brothers_son_count: number;
  blood_uncle_count: number;
  paternal_uncle_count: number;
  blood_uncles_son_count: number;
  paternal_uncles_son_count: number;
}

export type HeirType =
  | 'son'
  | 'daughter'
  | 'sons_son'
  | 'sons_daughter'
  | 'sons_sons_son'
  | 'sons_sons_daughter'
  | 'husband'
  | 'wife'
  | 'father'
  | 'mother'
  | 'fathers_father'
  | 'fathers_fathers_father'
  | 'mothers_mother'
  | 'fathers_mother'
  | 'mothers_mothers_mother'
  | 'fathers_fathers_mother'
  | 'fathers_mothers_mother'
  | 'blood_brother'
  | 'blood_sister'
  | 'paternal_brother'
  | 'paternal_sister'
  | 'maternal_brother'
  | 'maternal_sister'
  | 'blood_brothers_son'
  | 'paternal_brothers_son'
  | 'blood_uncle'
  | 'paternal_uncle'
  | 'blood_uncles_son'
  | 'paternal_uncles_son';

export type ShareMethod = 'fard' | 'asaba' | 'fard_plus_asaba' | 'blocked';

export interface HeirShare {
  heirType: HeirType;
  count: number;
  totalFraction: import('./Fraction').Fraction;
  perPersonFraction: import('./Fraction').Fraction;
  method: ShareMethod;
  ruleApplied: string;
  isBlocked: boolean;
  blockReason?: string;
}

export interface CalculationResult {
  // Estate
  grossAmount: number;
  burialExpenses: number;
  debtsTopeople: number;
  religiousDebts: number;
  netAmount: number;
  bequest: number;
  bequestCapped: boolean;
  finalAmount: number;

  // Shares
  shares: HeirShare[];
  method: 'awl' | 'radd' | 'exact';
  awlDenominator?: number;
  raddNotes?: string;
}

export function defaultHeirData(): HeirData {
  return {
    deceased_gender: 'male',
    wife_count: 0,
    husband_alive: false,
    son_count: 0,
    daughter_count: 0,
    sons_son_count: 0,
    sons_daughter_count: 0,
    sons_sons_son_count: 0,
    sons_sons_daughter_count: 0,
    father_alive: false,
    mother_alive: false,
    fathers_father_alive: false,
    fathers_fathers_father_alive: false,
    mothers_mother_alive: false,
    fathers_mother_alive: false,
    mothers_mothers_mother_alive: false,
    fathers_fathers_mother_alive: false,
    fathers_mothers_mother_alive: false,
    blood_brother_count: 0,
    blood_sister_count: 0,
    paternal_brother_count: 0,
    paternal_sister_count: 0,
    maternal_brother_count: 0,
    maternal_sister_count: 0,
    blood_brothers_son_count: 0,
    paternal_brothers_son_count: 0,
    blood_uncle_count: 0,
    paternal_uncle_count: 0,
    blood_uncles_son_count: 0,
    paternal_uncles_son_count: 0,
  };
}

export function defaultEstateInput(): EstateInput {
  return {
    mode: 'basic',
    gross_amount: 0,
    burial_expenses: 0,
    debts_to_people: 0,
    religious_debts: 0,
    bequest: 0,
    cash: 0,
    assets: 0,
    livestock: 0,
    gold_silver: 0,
    given_debts: 0,
    investments: 0,
    business_capital: 0,
    shroud: 0,
    funeral_expenses: 0,
  };
}
