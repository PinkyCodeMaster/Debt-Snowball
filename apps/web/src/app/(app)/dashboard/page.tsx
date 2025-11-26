"use client";

import { useDebtSnowball } from "@/contexts/DebtSnowballContext";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Calendar, TrendingDown, AlertCircle, PoundSterling, Wallet, CreditCard } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/calculations";

const BABY_STEPS_INFO = [
  { id: 1, name: "£1,000 Emergency Fund", shortName: "£1K Fund", description: "Save £1,000 for life's unexpected events", icon: "💷" },
  { id: 2, name: "Pay Off All Debt", shortName: "Debt Free", description: "Use the debt snowball to eliminate all debt (except mortgage)", icon: "❄️" },
  { id: 3, name: "3-6 Months Expenses", shortName: "Full Fund", description: "Build a fully funded emergency fund", icon: "🛡️" },
  { id: 4, name: "Invest 15%", shortName: "Retirement", description: "Invest 15% of income into pensions and ISAs", icon: "📈" },
  { id: 5, name: "Children's Education", shortName: "Education", description: "Save for your children's future", icon: "🎓" },
  { id: 6, name: "Pay Off Mortgage", shortName: "Own Home", description: "Pay off your home early", icon: "🏠" },
  { id: 7, name: "Build Wealth & Give", shortName: "Wealth", description: "Build wealth and be outrageously generous", icon: "🎁" },
];

export default function BabyStepsPage() {
  const { babySteps, totalDebt, monthlyDiscretionary, debtFreeDate, isLoading, incomes, expenses, debts } = useDebtSnowball();
  const router = useRouter();

  if (isLoading) return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading your journey...</div>;

  const currentStepInfo = BABY_STEPS_INFO[babySteps.currentStep - 1];
  const isStep1 = babySteps.currentStep === 1;
  const isStep2 = babySteps.currentStep === 2;
  const isStep3 = babySteps.currentStep === 3;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Debt-Free Journey</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Following Dave Ramsey's Baby Steps</p>
      </div>

      {/* Current Step Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-green-500">CURRENT STEP</span>
          <span className="text-3xl">{currentStepInfo.icon}</span>
        </div>
        <h2 className="text-xl font-bold mb-1">Step {babySteps.currentStep}: {currentStepInfo.name}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{currentStepInfo.description}</p>

        {/* Step 1 Progress */}
        {isStep1 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Emergency Fund Progress</span>
              <span className="text-sm font-bold">{formatCurrency(babySteps.step1Progress)} / {formatCurrency(babySteps.step1Target)}</span>
            </div>
            <div className="w-full h-2 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${(babySteps.step1Progress / babySteps.step1Target) * 100}%` }} />
            </div>
            <p className="text-xs text-center mt-1 text-green-600 dark:text-green-400">{Math.round((babySteps.step1Progress / babySteps.step1Target) * 100)}% Complete</p>
          </div>
        )}

        {/* Step 2 Stats */}
        {isStep2 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <TrendingDown size={20} className="text-red-500" />
              <span className="font-bold">{formatCurrency(totalDebt)}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Total Debt</span>
            </div>
            {debtFreeDate && (
              <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <Calendar size={20} className="text-green-500" />
                <span className="font-bold">{formatDate(debtFreeDate)}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Debt-Free Date</span>
              </div>
            )}
            {monthlyDiscretionary > 0 && (
              <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <span className="font-bold">{formatCurrency(monthlyDiscretionary)}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Extra Per Month</span>
              </div>
            )}
          </div>
        )}

        {/* Step 3 Progress */}
        {isStep3 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Full Emergency Fund</span>
              <span className="text-sm font-bold">{formatCurrency(babySteps.step3Progress)} / {formatCurrency(babySteps.step3Target)}</span>
            </div>
            <div className="w-full h-2 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${Math.min((babySteps.step3Progress / babySteps.step3Target) * 100, 100)}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onClick={() => router.push("/income")} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex flex-col items-center gap-1">
            <PoundSterling size={20} className="text-green-500" />
            <span className="font-semibold text-sm">Income</span>
            <span className="text-lg font-bold">{incomes.length}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">sources</span>
          </button>
          <button onClick={() => router.push("/budget")} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex flex-col items-center gap-1">
            <Wallet size={20} className="text-yellow-500" />
            <span className="font-semibold text-sm">Budget</span>
            <span className="text-lg font-bold">{expenses.length}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">expenses</span>
          </button>
          <button onClick={() => router.push("/snowball")} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex flex-col items-center gap-1">
            <CreditCard size={20} className="text-red-500" />
            <span className="font-semibold text-sm">Debts</span>
            <span className="text-lg font-bold">{debts.filter(d => d.status === "active").length}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">active</span>
          </button>
        </div>
      </div>

      {/* Budget Warning */}
      {monthlyDiscretionary < 0 && babySteps.currentStep <= 2 && (
        <div className="flex gap-4 bg-yellow-100 dark:bg-yellow-800 p-4 rounded-lg">
          <AlertCircle size={20} className="text-yellow-600" />
          <div>
            <h4 className="font-semibold text-yellow-700 dark:text-yellow-300">Budget Alert</h4>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              Your expenses exceed income by {formatCurrency(Math.abs(monthlyDiscretionary))} per month. Review your budget to free up money for debt payments.
            </p>
          </div>
        </div>
      )}

      {/* All Steps */}
      <div>
        <h3 className="text-lg font-semibold mb-2">All 7 Baby Steps</h3>
        <div className="space-y-2">
          {BABY_STEPS_INFO.map((step) => {
            const isComplete = step.id < babySteps.currentStep ||
              (step.id === 1 && babySteps.step1Completed) ||
              (step.id === 2 && babySteps.step2Completed) ||
              (step.id === 3 && babySteps.step3Completed);
            const isCurrent = step.id === babySteps.currentStep;

            return (
              <div key={step.id} className={`flex gap-3 p-3 rounded-lg border ${isCurrent ? "border-blue-500" : "border-gray-200 dark:border-gray-700"} ${isComplete ? "opacity-70" : ""} bg-gray-50 dark:bg-gray-700`}>
                <div className="flex items-center">{isComplete ? <CheckCircle2 className="text-green-500" /> : <Circle className={`${isCurrent ? "text-blue-500" : "text-gray-400"}`} />}</div>
                <div className="flex-1">
                  <h4 className={`font-semibold text-sm ${isCurrent ? "text-blue-500" : ""} ${isComplete ? "text-green-500" : ""}`}>
                    {step.icon} Step {step.id}: {step.shortName}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
