export type PlanningStatus = 'covered' | 'watch' | 'reserve_gap' | 'high_exposure';
export type DataMode = 'live' | 'mixed';

export interface HoldingInput {
  symbol: string;
  name: string;
  quantity: number;
  isStablecoin?: boolean;
  manuallyClassified?: boolean;
}

export interface TreasuryInput {
  name: string;
  organizationType: 'web3_startup' | 'dao' | 'protocol' | 'freelancer' | 'personal' | 'other';
  reportingCurrency: 'USD';
  monthlyExpenses: number;
  oneTimeExpenses: number;
  nextPaymentDate?: string;
  targetReserveMonths: number;
  minimumProtectedReservePercent: number;
  riskTolerance: 'conservative' | 'balanced' | 'aggressive';
  holdings: HoldingInput[];
}
