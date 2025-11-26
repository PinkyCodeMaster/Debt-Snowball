import type { Debt, SnowballPlan } from '@/types/debt';
import type { Income, UniversalCredit, IncomeFrequency } from '@/types/income';
import type { Expense, ExpenseFrequency } from '@/types/expense';

export function calculateUC(
    baseUC: number,
    earnedIncome: number,
    workAllowance: number = 404,
    taperRate: number = 0.55
): number {
    if (earnedIncome <= workAllowance) {
        return baseUC;
    }

    const excessIncome = earnedIncome - workAllowance;
    const deduction = excessIncome * taperRate;
    const adjustedUC = baseUC - deduction;

    return Math.max(adjustedUC, 0);
}

export function convertToMonthly(amount: number, frequency: IncomeFrequency | ExpenseFrequency): number {
    switch (frequency) {
        case 'weekly':
            return (amount * 52) / 12;
        case 'fortnightly':
            return (amount * 26) / 12;
        case '4-weekly':
            return (amount * 13) / 12;
        case 'monthly':
            return amount;
        case 'quarterly':
            return amount / 3;
        case 'annually':
            return amount / 12;
        default:
            return amount;
    }
}

export function calculateTotalMonthlyIncome(
    incomes: Income[],
    ucSettings?: UniversalCredit
): number {
    let totalMonthly = 0;
    let totalEarnedIncome = 0;

    incomes.forEach(income => {
        const monthlyAmount = convertToMonthly(income.amount, income.frequency);

        if (income.type === 'universal_credit') {
            return;
        }

        if (income.type === 'wages' || income.type === 'side_project' || income.type === 'self_employment') {
            totalEarnedIncome += monthlyAmount;
        } else {
            totalMonthly += monthlyAmount;
        }
    });

    if (ucSettings) {
        const adjustedUC = calculateUC(
            ucSettings.baseAmount,
            totalEarnedIncome,
            ucSettings.workAllowance,
            ucSettings.taperRate
        );
        totalMonthly += adjustedUC;
    }

    totalMonthly += totalEarnedIncome;

    return totalMonthly;
}

export function calculateTotalMonthlyExpenses(expenses: Expense[]): number {
    return expenses.reduce((total, expense) => {
        return total + convertToMonthly(expense.amount, expense.frequency);
    }, 0);
}

export function calculateSnowballPlan(
    debts: Debt[],
    extraPayment: number = 0
): SnowballPlan[] {
    const activeDebts = debts.filter(d => d.status === 'active');

    const ccjDebts = activeDebts.filter(d => d.isCCJ);
    const otherDebts = activeDebts.filter(d => !d.isCCJ);

    otherDebts.sort((a, b) => a.balance - b.balance);

    const sortedDebts = [...ccjDebts, ...otherDebts];

    return sortedDebts.map((debt, index) => ({
        debtId: debt.id,
        debtName: debt.name,
        currentBalance: debt.balance,
        monthlyPayment: index === 0 ? debt.minimumPayment + extraPayment : debt.minimumPayment,
        isTarget: index === 0,
        position: index + 1,
    }));
}

export function calculateDebtFreeDate(
    debts: Debt[],
    extraMonthlyPayment: number
): Date | null {
    const activeDebts = debts.filter(d => d.status === 'active');

    if (activeDebts.length === 0) {
        return null;
    }

    const ccjDebts = activeDebts.filter(d => d.isCCJ);
    const otherDebts = activeDebts.filter(d => !d.isCCJ);
    otherDebts.sort((a, b) => a.balance - b.balance);
    const sortedDebts = [...ccjDebts, ...otherDebts];

    let totalMonths = 0;
    let rollingExtra = extraMonthlyPayment;

    for (const debt of sortedDebts) {
        let balance = debt.balance;
        const monthlyPayment = debt.minimumPayment + rollingExtra;
        const monthlyInterestRate = debt.interestRate / 12 / 100;

        while (balance > 0) {
            const interestCharge = balance * monthlyInterestRate;
            const principalPayment = monthlyPayment - interestCharge;

            if (principalPayment <= 0) {
                return null;
            }

            balance = Math.max(balance - principalPayment, 0);
            totalMonths++;

            if (totalMonths > 1200) {
                return null;
            }
        }

        rollingExtra += debt.minimumPayment;
    }

    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setMonth(futureDate.getMonth() + totalMonths);
    return futureDate;
}

export function calculateTotalDebt(debts: Debt[]): number {
    return debts
        .filter(d => d.status === 'active')
        .reduce((total, debt) => total + debt.balance, 0);
}

export function calculateMinimumPayments(debts: Debt[]): number {
    return debts
        .filter(d => d.status === 'active')
        .reduce((total, debt) => total + debt.minimumPayment, 0);
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
}
