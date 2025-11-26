"use client";

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import type { Debt, DebtPayment } from "@/types/debt";
import type { Income, UniversalCredit } from "@/types/income";
import type { Expense } from "@/types/expense";
import type { BabyStepsProgress } from "@/types/babySteps";
import {
    calculateSnowballPlan,
    calculateDebtFreeDate,
    calculateTotalMonthlyIncome,
    calculateTotalMonthlyExpenses,
    calculateTotalDebt,
    calculateMinimumPayments,
} from "@/lib/calculations";

const STORAGE_KEYS = {
    DEBTS: "debt_snowball/debts",
    INCOMES: "debt_snowball/incomes",
    EXPENSES: "debt_snowball/expenses",
    UC_SETTINGS: "debt_snowball/uc_settings",
    BABY_STEPS: "debt_snowball/baby_steps",
    DEBT_PAYMENTS: "debt_snowball/debt_payments",
};

interface DebtSnowballContextType {
    debts: Debt[];
    incomes: Income[];
    expenses: Expense[];
    ucSettings?: UniversalCredit;
    babySteps: BabyStepsProgress;
    debtPayments: DebtPayment[];
    isLoading: boolean;

    addDebt: (debt: Omit<Debt, "id" | "createdAt" | "status">) => Promise<void>;
    updateDebt: (id: string, updates: Partial<Debt>) => Promise<void>;
    deleteDebt: (id: string) => Promise<void>;
    markDebtPaid: (id: string) => Promise<void>;
    addDebtPayment: (debtId: string, amount: number, notes?: string) => Promise<void>;

    addIncome: (income: Omit<Income, "id" | "createdAt">) => Promise<void>;
    updateIncome: (id: string, updates: Partial<Income>) => Promise<void>;
    deleteIncome: (id: string) => Promise<void>;

    addExpense: (expense: Omit<Expense, "id" | "createdAt">) => Promise<void>;
    updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;

    updateUCSettings: (settings: UniversalCredit) => Promise<void>;
    updateBabySteps: (updates: Partial<BabyStepsProgress>) => Promise<void>;
    updateEmergencyFund: (amount: number) => Promise<void>;

    totalMonthlyIncome: number;
    totalMonthlyExpenses: number;
    totalDebt: number;
    minimumPayments: number;
    monthlyDiscretionary: number;
    snowballPlan: ReturnType<typeof calculateSnowballPlan>;
    debtFreeDate: ReturnType<typeof calculateDebtFreeDate>;
}

const DebtSnowballContext = createContext<DebtSnowballContextType | undefined>(undefined);

export const DebtSnowballProvider = ({ children }: { children: ReactNode }) => {
    const [debts, setDebts] = useState<Debt[]>([]);
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [ucSettings, setUCSettings] = useState<UniversalCredit>();
    const [babySteps, setBabySteps] = useState<BabyStepsProgress>({
        currentStep: 1,
        step1Progress: 0,
        step1Target: 1000,
        step1Completed: false,
        step2Completed: false,
        step3Progress: 0,
        step3Target: 0,
        step3Completed: false,
        emergencyFundBalance: 0,
        updatedAt: new Date().toISOString(),
    });
    const [debtPayments, setDebtPayments] = useState<DebtPayment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load persisted data from localStorage
    useEffect(() => {
        const loadData = () => {
            try {
                const debtsData = localStorage.getItem(STORAGE_KEYS.DEBTS);
                const incomesData = localStorage.getItem(STORAGE_KEYS.INCOMES);
                const expensesData = localStorage.getItem(STORAGE_KEYS.EXPENSES);
                const ucData = localStorage.getItem(STORAGE_KEYS.UC_SETTINGS);
                const babyStepsData = localStorage.getItem(STORAGE_KEYS.BABY_STEPS);
                const paymentsData = localStorage.getItem(STORAGE_KEYS.DEBT_PAYMENTS);

                if (debtsData) setDebts(JSON.parse(debtsData));
                if (incomesData) setIncomes(JSON.parse(incomesData));
                if (expensesData) setExpenses(JSON.parse(expensesData));
                if (ucData) setUCSettings(JSON.parse(ucData));
                if (babyStepsData) setBabySteps(JSON.parse(babyStepsData));
                if (paymentsData) setDebtPayments(JSON.parse(paymentsData));
            } catch (error) {
                console.error("Failed to load data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Utility function for saving to localStorage
    const saveToStorage = async <T,>(key: string, data: T) => {
        setTimeout(() => localStorage.setItem(key, JSON.stringify(data)), 0);
    };

    // Debt operations
    const saveDebts = async (newDebts: Debt[]) => {
        setDebts(newDebts);
        await saveToStorage(STORAGE_KEYS.DEBTS, newDebts);
    };

    const addDebt = async (debt: Omit<Debt, "id" | "createdAt" | "status">) => {
        const newDebt: Debt = { ...debt, id: Date.now().toString(), status: "active", createdAt: new Date().toISOString() };
        await saveDebts([...debts, newDebt]);
    };

    const updateDebt = async (id: string, updates: Partial<Debt>) => {
        const updated = debts.map(d => d.id === id ? { ...d, ...updates } : d);
        await saveDebts(updated);
    };

    const deleteDebt = async (id: string) => {
        await saveDebts(debts.filter(d => d.id !== id));
    };

    const markDebtPaid = async (id: string) => {
        const debt = debts.find(d => d.id === id);
        if (!debt) return;

        const payment: DebtPayment = {
            id: Date.now().toString(),
            debtId: id,
            amount: debt.balance,
            paymentDate: new Date().toISOString(),
            balanceAfter: 0,
            notes: "Final payment - DEBT FREE! 🎉",
        };

        const updatedPayments = [...debtPayments, payment];
        setDebtPayments(updatedPayments);
        await saveToStorage(STORAGE_KEYS.DEBT_PAYMENTS, updatedPayments);

        await updateDebt(id, { status: "paid_off", paidOffDate: new Date().toISOString(), balance: 0 });

        const remainingDebts = debts.filter(d => d.id !== id && d.status === "active");
        if (remainingDebts.length === 0) {
            await updateBabySteps({ step2Completed: true, currentStep: 3 });
        }
    };

    const addDebtPayment = async (debtId: string, amount: number, notes?: string) => {
        const debt = debts.find(d => d.id === debtId);
        if (!debt) return;

        const newBalance = Math.max(debt.balance - amount, 0);

        const payment: DebtPayment = {
            id: Date.now().toString(),
            debtId,
            amount,
            paymentDate: new Date().toISOString(),
            balanceAfter: newBalance,
            notes,
        };

        const updatedPayments = [...debtPayments, payment];
        setDebtPayments(updatedPayments);
        await saveToStorage(STORAGE_KEYS.DEBT_PAYMENTS, updatedPayments);

        if (newBalance === 0) {
            await markDebtPaid(debtId);
        } else {
            await updateDebt(debtId, { balance: newBalance });
        }
    };

    // Income / Expenses / UC / Baby Steps similar to debt...
    const saveIncomes = async (newIncomes: Income[]) => { setIncomes(newIncomes); await saveToStorage(STORAGE_KEYS.INCOMES, newIncomes); };
    const addIncome = async (income: Omit<Income, "id" | "createdAt">) => {
        const newIncome: Income = { ...income, id: Date.now().toString(), createdAt: new Date().toISOString() };
        await saveIncomes([...incomes, newIncome]);
    };
    const updateIncome = async (id: string, updates: Partial<Income>) => { await saveIncomes(incomes.map(i => i.id === id ? { ...i, ...updates } : i)); };
    const deleteIncome = async (id: string) => { await saveIncomes(incomes.filter(i => i.id !== id)); };

    const saveExpenses = async (newExpenses: Expense[]) => { setExpenses(newExpenses); await saveToStorage(STORAGE_KEYS.EXPENSES, newExpenses); };
    const addExpense = async (expense: Omit<Expense, "id" | "createdAt">) => {
        const newExpense: Expense = { ...expense, id: Date.now().toString(), createdAt: new Date().toISOString() };
        await saveExpenses([...expenses, newExpense]);
    };
    const updateExpense = async (id: string, updates: Partial<Expense>) => { await saveExpenses(expenses.map(e => e.id === id ? { ...e, ...updates } : e)); };
    const deleteExpense = async (id: string) => { await saveExpenses(expenses.filter(e => e.id !== id)); };

    const updateUCSettings = async (settings: UniversalCredit) => { setUCSettings(settings); await saveToStorage(STORAGE_KEYS.UC_SETTINGS, settings); };
    const updateBabySteps = async (updates: Partial<BabyStepsProgress>) => {
        const updated = { ...babySteps, ...updates, updatedAt: new Date().toISOString() };
        setBabySteps(updated);
        await saveToStorage(STORAGE_KEYS.BABY_STEPS, updated);
    };

    const updateEmergencyFund = async (amount: number) => {
        const updates: Partial<BabyStepsProgress> = { emergencyFundBalance: amount };
        if (babySteps.currentStep === 1 && amount >= babySteps.step1Target) {
            updates.step1Progress = amount;
            updates.step1Completed = true;
            updates.currentStep = 2;
        } else if (babySteps.currentStep === 1) {
            updates.step1Progress = amount;
        } else if (babySteps.currentStep === 3) {
            updates.step3Progress = amount;
            if (amount >= babySteps.step3Target) {
                updates.step3Completed = true;
                updates.currentStep = 4;
            }
        }
        await updateBabySteps(updates);
    };

    // Derived values
    const totalMonthlyIncome = useMemo(() => calculateTotalMonthlyIncome(incomes, ucSettings), [incomes, ucSettings]);
    const totalMonthlyExpenses = useMemo(() => calculateTotalMonthlyExpenses(expenses), [expenses]);
    const totalDebt = useMemo(() => calculateTotalDebt(debts), [debts]);
    const minimumPayments = useMemo(() => calculateMinimumPayments(debts), [debts]);
    const monthlyDiscretionary = useMemo(() => totalMonthlyIncome - totalMonthlyExpenses - minimumPayments, [totalMonthlyIncome, totalMonthlyExpenses, minimumPayments]);
    const snowballPlan = useMemo(() => calculateSnowballPlan(debts, Math.max(monthlyDiscretionary, 0)), [debts, monthlyDiscretionary]);
    const debtFreeDate = useMemo(() => calculateDebtFreeDate(debts, Math.max(monthlyDiscretionary, 0)), [debts, monthlyDiscretionary]);

    return (
        <DebtSnowballContext.Provider value={{
            debts, incomes, expenses, ucSettings, babySteps, debtPayments, isLoading,
            addDebt, updateDebt, deleteDebt, markDebtPaid, addDebtPayment,
            addIncome, updateIncome, deleteIncome,
            addExpense, updateExpense, deleteExpense,
            updateUCSettings, updateBabySteps, updateEmergencyFund,
            totalMonthlyIncome, totalMonthlyExpenses, totalDebt, minimumPayments,
            monthlyDiscretionary, snowballPlan, debtFreeDate,
        }}>
            {children}
        </DebtSnowballContext.Provider>
    );
};

export const useDebtSnowball = () => {
    const context = useContext(DebtSnowballContext);
    if (!context) throw new Error("useDebtSnowball must be used within DebtSnowballProvider");
    return context;
};
