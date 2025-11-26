export type IncomeType = 
  | 'wages'
  | 'side_project'
  | 'universal_credit'
  | 'benefits'
  | 'self_employment'
  | 'rental'
  | 'other';

export type IncomeFrequency = 'weekly' | 'fortnightly' | '4-weekly' | 'monthly';

export type Income = {
  id: string;
  type: IncomeType;
  name: string;
  amount: number;
  frequency: IncomeFrequency;
  isNet: boolean;
  startDate: string;
  paymentDay?: number;
  notes?: string;
  createdAt: string;
};

export type UniversalCredit = {
  baseAmount: number;
  workAllowance: number;
  taperRate: number;
  housingIncluded: boolean;
  councilTaxIncluded: boolean;
  paymentDay: number;
};
