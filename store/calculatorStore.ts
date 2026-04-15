'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EstateInput, HeirData, CalculationResult } from '@/engine/types';
import { defaultEstateInput, defaultHeirData } from '@/engine/types';

export type Phase = 1 | 2 | 3;

interface CalculatorState {
  phase: Phase;
  estate: EstateInput;
  heirs: HeirData;
  result: CalculationResult | null;
  wizardStep: number;

  setPhase: (phase: Phase) => void;
  setEstate: (updates: Partial<EstateInput>) => void;
  setHeirs: (updates: Partial<HeirData>) => void;
  setResult: (result: CalculationResult) => void;
  setWizardStep: (step: number) => void;
  reset: () => void;
}

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set) => ({
      phase: 1,
      estate: defaultEstateInput(),
      heirs: defaultHeirData(),
      result: null,
      wizardStep: 0,

      setPhase: (phase) => set({ phase }),
      setEstate: (updates) => set((state) => ({ estate: { ...state.estate, ...updates } })),
      setHeirs: (updates) => set((state) => ({ heirs: { ...state.heirs, ...updates } })),
      setResult: (result) => set({ result }),
      setWizardStep: (wizardStep) => set({ wizardStep }),
      reset: () => set({ phase: 1, estate: defaultEstateInput(), heirs: defaultHeirData(), result: null, wizardStep: 0 }),
    }),
    {
      name: 'meros-calculator-state',
      // Never persist result — Fraction class instances lose their methods
      // after JSON round-trip. PhaseThree recalculates on every mount.
      partialize: (state) => ({
        phase: state.phase,
        estate: state.estate,
        heirs: state.heirs,
        wizardStep: state.wizardStep,
      }),
    },
  ),
);
