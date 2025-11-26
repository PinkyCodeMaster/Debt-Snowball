"use client";

import { useState } from "react";
import { useDebtSnowball } from "@/contexts/DebtSnowballContext";
import { formatCurrency } from "@/lib/calculations";
import { Plus, X, Trash2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import type { ExpenseCategory, ExpenseFrequency, ExpensePriority } from "@/types/expense";

const EXPENSE_CATEGORIES = [
  { value: 'housing', label: 'Rent/Mortgage', priority: 'essential' },
  { value: 'utilities', label: 'Utilities', priority: 'essential' },
  { value: 'food', label: 'Food/Groceries', priority: 'essential' },
  { value: 'transport', label: 'Transport', priority: 'essential' },
  { value: 'insurance', label: 'Insurance', priority: 'essential' },
  { value: 'medical', label: 'Medical', priority: 'essential' },
  { value: 'childcare', label: 'Childcare', priority: 'essential' },
  { value: 'phone', label: 'Phone/Internet', priority: 'essential' },
  { value: 'subscription', label: 'Subscriptions', priority: 'non_essential' },
  { value: 'entertainment', label: 'Entertainment', priority: 'non_essential' },
  { value: 'other', label: 'Other', priority: 'non_essential' },
];

const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
];

export default function BudgetPage() {
  const {
    expenses,
    addExpense,
    deleteExpense,
    totalMonthlyIncome,
    totalMonthlyExpenses,
    minimumPayments,
    monthlyDiscretionary,
    updateEmergencyFund,
    babySteps,
    isLoading,
  } = useDebtSnowball();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    category: ExpenseCategory;
    amount: string;
    frequency: ExpenseFrequency;
    priority: ExpensePriority;
    dueDate?: string;
  }>({
    name: '',
    category: 'food',
    amount: '',
    frequency: 'monthly',
    priority: 'essential',
    dueDate: '',
  });

  const [emergencyAmount, setEmergencyAmount] = useState(babySteps.emergencyFundBalance.toString());

  const handleAddExpense = async () => {
    if (!formData.name || !formData.amount) {
      alert("Please fill in all required fields");
      return;
    }
    await addExpense({
      name: formData.name,
      category: formData.category,
      amount: parseFloat(formData.amount),
      frequency: formData.frequency,
      priority: formData.priority,
      isUCPaid: false,
      dueDate: formData.dueDate ? parseInt(formData.dueDate) : undefined,
    });

    setFormData({
      name: '',
      category: 'food',
      amount: '',
      frequency: 'monthly',
      priority: 'essential',
      dueDate: '',
    });
    setShowAddModal(false);
  };

  const handleSaveEmergencyFund = async () => {
    const amount = parseFloat(emergencyAmount);
    if (isNaN(amount) || amount < 0) {
      alert("Please enter a valid amount");
      return;
    }
    await updateEmergencyFund(amount);
    setShowEmergencyModal(false);
  };

  const essentialExpenses = expenses.filter(e => e.priority === 'essential');
  const nonEssentialExpenses = expenses.filter(e => e.priority === 'non_essential');
  const budgetHealth = monthlyDiscretionary >= 0 ? 'positive' : 'negative';

  if (isLoading) {
    return (
      <div className="flex h-screen justify-center items-center bg-gray-50">
        <p className="text-gray-500 text-lg">Loading budget...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget Overview</h1>
          <p className="text-gray-500 mt-1">Monthly breakdown</p>
        </div>
        <button
          className="w-11 h-11 bg-blue-500 rounded-full flex justify-center items-center"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="text-white" />
        </button>
      </div>

      {/* Summary cards */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 bg-white rounded-xl p-4 border border-gray-200 space-y-1">
          <TrendingUp className="text-green-500" />
          <p className="text-xs text-gray-500">Income</p>
          <p className="text-lg font-bold text-green-600">{formatCurrency(totalMonthlyIncome)}</p>
        </div>
        <div className="flex-1 bg-white rounded-xl p-4 border border-gray-200 space-y-1">
          <TrendingDown className="text-red-500" />
          <p className="text-xs text-gray-500">Expenses</p>
          <p className="text-lg font-bold text-red-600">{formatCurrency(totalMonthlyExpenses)}</p>
        </div>
        <div className="flex-1 bg-white rounded-xl p-4 border border-gray-200 space-y-1">
          <DollarSign className="text-orange-500" />
          <p className="text-xs text-gray-500">Debt Payments</p>
          <p className="text-lg font-bold text-orange-600">{formatCurrency(minimumPayments)}</p>
        </div>
      </div>

      {/* Budget health */}
      <div className={`rounded-2xl p-5 mb-4 text-center ${budgetHealth === 'positive' ? 'bg-green-100' : 'bg-red-100'}`}>
        <p className="text-sm font-semibold">
          {budgetHealth === 'positive' ? 'Available for Extra Debt Payments' : 'Budget Shortfall'}
        </p>
        <p className={`text-2xl font-bold ${budgetHealth === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(Math.abs(monthlyDiscretionary))}
        </p>
        {budgetHealth === 'negative' && (
          <p className="text-sm text-gray-500 mt-2">
            Review expenses to free up money for debt payments
          </p>
        )}
      </div>

      {/* Emergency fund */}
      <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Emergency Fund</h2>
            <p className="text-sm text-gray-500 mt-1">Goal: {formatCurrency(babySteps.step1Target)}</p>
          </div>
          <button className="bg-blue-500 px-4 py-2 rounded-lg text-white font-semibold" onClick={() => setShowEmergencyModal(true)}>
            Update
          </button>
        </div>
        <div className="space-y-2">
          <div className="w-full h-2 bg-green-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600"
              style={{ width: `${Math.min((babySteps.emergencyFundBalance / babySteps.step1Target) * 100, 100)}%` }}
            />
          </div>
          <p className="text-lg font-bold text-green-600">{formatCurrency(babySteps.emergencyFundBalance)}</p>
        </div>
      </div>

      {/* Expense sections */}
      <ExpenseSection title={`Essential Expenses (${essentialExpenses.length})`} expenses={essentialExpenses} deleteExpense={deleteExpense} />
      {nonEssentialExpenses.length > 0 && (
        <ExpenseSection title={`Non-Essential Expenses (${nonEssentialExpenses.length})`} expenses={nonEssentialExpenses} deleteExpense={deleteExpense} />
      )}

      {/* Modals would go here */}
    </div>
  );
}

function ExpenseSection({ title, expenses, deleteExpense }: any) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
      {expenses.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No expenses added yet</p>
      ) : (
        expenses.map((expense: any) => (
          <div key={expense.id} className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <p className="text-base font-semibold text-gray-900">{expense.name}</p>
                <p className="text-xs text-gray-500">
                  {expense.category} {expense.dueDate && `• Due day ${expense.dueDate}`}
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Delete ${expense.name}?`)) deleteExpense(expense.id);
                }}
              >
                <Trash2 className="text-red-500" />
              </button>
            </div>
            <p className="text-base font-semibold text-red-600">
              {formatCurrency(expense.amount)} / {expense.frequency}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
