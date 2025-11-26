export type DebtType =
    | 'credit_card'
    | 'personal_loan'
    | 'overdraft'
    | 'bnpl'
    | 'car_finance'
    | 'ccj'
    | 'payday_loan'
    | 'store_card'
    | 'mortgage';

export type Debt = {
    id: string;
    name: string;
    type: DebtType;
    balance: number;
    interestRate: number;
    minimumPayment: number;
    paymentDay?: number;
    isCCJ: boolean;
    ccjDeadline?: string;
    creditor: string;
    status: 'active' | 'paid_off';
    paidOffDate?: string;
    createdAt: string;
};

export type DebtPayment = {
    id: string;
    debtId: string;
    amount: number;
    paymentDate: string;
    balanceAfter: number;
    notes?: string;
};

export type SnowballPlan = {
    debtId: string;
    debtName: string;
    currentBalance: number;
    monthlyPayment: number;
    isTarget: boolean;
    position: number;
};
