export type ExpenseCategory =
    | 'housing'
    | 'utilities'
    | 'food'
    | 'transport'
    | 'insurance'
    | 'subscription'
    | 'childcare'
    | 'medical'
    | 'phone'
    | 'entertainment'
    | 'other';

export type ExpensePriority = 'essential' | 'non_essential';

export type ExpenseFrequency = 'weekly' | 'monthly' | 'quarterly' | 'annually';

export type Expense = {
    id: string;
    name: string;
    amount: number;
    category: ExpenseCategory;
    priority: ExpensePriority;
    frequency: ExpenseFrequency;
    dueDate?: number;
    isUCPaid: boolean;
    notes?: string;
    createdAt: string;
};
