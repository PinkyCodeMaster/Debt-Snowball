// app/(tabs)/income/page.tsx
"use client";

import { useState } from "react";
import { useDebtSnowball } from "@/contexts/DebtSnowballContext";
import { formatCurrency, convertToMonthly, calculateUC } from "@/lib/calculations";
import { Plus, X, Trash2, TrendingUp, Info } from "lucide-react";

const INCOME_TYPES = [
    { value: 'wages', label: 'Wages/Salary' },
    { value: 'side_project', label: 'Side Projects' },
    { value: 'self_employment', label: 'Self-Employment' },
    { value: 'universal_credit', label: 'Universal Credit' },
    { value: 'benefits', label: 'Other Benefits' },
    { value: 'rental', label: 'Rental Income' },
    { value: 'other', label: 'Other' },
];

const FREQUENCIES = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'fortnightly', label: 'Fortnightly' },
    { value: '4-weekly', label: '4-Weekly' },
    { value: 'monthly', label: 'Monthly' },
];

export default function IncomePage() {
    const { incomes, addIncome, deleteIncome, ucSettings, updateUCSettings, totalMonthlyIncome, isLoading } = useDebtSnowball();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUCModal, setShowUCModal] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        type: 'wages',
        amount: '',
        frequency: 'monthly',
        isNet: true,
        paymentDay: '',
    });

    const [ucFormData, setUCFormData] = useState({
        baseAmount: ucSettings?.baseAmount.toString() || '',
        housingIncluded: ucSettings?.housingIncluded || false,
        paymentDay: ucSettings?.paymentDay?.toString() || '1',
    });

    const handleAddIncome = async () => {
        if (!formData.name || !formData.amount) {
            alert("Please fill in all required fields");
            return;
        }

        await addIncome({
            name: formData.name,
            type: formData.type,
            amount: parseFloat(formData.amount),
            frequency: formData.frequency,
            isNet: formData.isNet,
            startDate: new Date().toISOString(),
            paymentDay: formData.paymentDay ? parseInt(formData.paymentDay) : undefined,
        });

        setFormData({ name: '', type: 'wages', amount: '', frequency: 'monthly', isNet: true, paymentDay: '' });
        setShowAddModal(false);
    };

    const handleSaveUC = async () => {
        if (!ucFormData.baseAmount) {
            alert("Please enter your Universal Credit base amount");
            return;
        }

        await updateUCSettings({
            baseAmount: parseFloat(ucFormData.baseAmount),
            workAllowance: 404,
            taperRate: 0.55,
            housingIncluded: ucFormData.housingIncluded,
            councilTaxIncluded: false,
            paymentDay: parseInt(ucFormData.paymentDay) || 1,
        });

        setShowUCModal(false);
    };

    const handleDeleteIncome = (income) => {
        if (confirm(`Delete ${income.name}?`)) deleteIncome(income.id);
    };

    const totalEarnedIncome = incomes
        .filter(i => ['wages', 'side_project', 'self_employment'].includes(i.type))
        .reduce((sum, i) => sum + convertToMonthly(i.amount, i.frequency), 0);

    const adjustedUC = ucSettings ? calculateUC(ucSettings.baseAmount, totalEarnedIncome) : 0;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen text-gray-500">
                Loading income...
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Income</h1>
                    <p className="text-gray-500">Track all your income sources</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-indigo-600 w-11 h-11 rounded-full flex items-center justify-center text-white"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Total Monthly Income */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 text-center">
                <p className="text-green-700 font-semibold mb-2">Total Monthly Income</p>
                <p className="text-3xl font-bold text-green-800 mb-2">{formatCurrency(totalMonthlyIncome)}</p>
                <p className="text-gray-500">{incomes.length} {incomes.length === 1 ? 'source' : 'sources'}</p>
            </div>

            {/* Universal Credit */}
            {ucSettings ? (
                <div className="border rounded-xl p-4 mb-6 bg-white">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="font-semibold text-lg mb-1">Universal Credit</h2>
                            <p className="text-gray-500 text-sm">Automatically adjusted for earnings</p>
                        </div>
                        <button onClick={() => setShowUCModal(true)}>
                            <Info size={20} className="text-blue-500" />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                        <div className="bg-gray-50 p-3 rounded">
                            <p className="text-xs text-gray-500">Base Amount</p>
                            <p className="font-semibold">{formatCurrency(ucSettings.baseAmount)}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                            <p className="text-xs text-gray-500">Adjusted UC</p>
                            <p className="font-semibold">{formatCurrency(adjustedUC)}</p>
                        </div>
                    </div>
                    {totalEarnedIncome > 404 && (
                        <p className="text-xs text-gray-500 italic">
                            £{((totalEarnedIncome - 404) * 0.55).toFixed(0)} deducted due to earnings over work allowance
                        </p>
                    )}
                </div>
            ) : (
                <button
                    onClick={() => setShowUCModal(true)}
                    className="w-full bg-gray-100 border border-gray-300 p-4 rounded-xl mb-6 text-indigo-600 font-semibold"
                >
                    + Set Up Universal Credit
                </button>
            )}

            {/* Income List */}
            <div>
                <h2 className="text-xl font-bold mb-4">Your Income Sources</h2>
                {incomes.length === 0 ? (
                    <div className="flex flex-col items-center py-16">
                        <TrendingUp size={48} className="text-gray-300" />
                        <p className="font-semibold text-gray-700 mt-4">No income sources yet</p>
                        <p className="text-gray-500 text-sm mt-1">Add your first income source to get started</p>
                    </div>
                ) : (
                    incomes.map((income) => (
                        <div key={income.id} className="border rounded-xl p-4 mb-4 bg-white flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-gray-800">{income.name}</p>
                                    <p className="text-gray-500 text-sm">
                                        {INCOME_TYPES.find(t => t.value === income.type)?.label} • {FREQUENCIES.find(f => f.value === income.frequency)?.label}
                                        {income.paymentDay && ` • Day ${income.paymentDay}`}
                                    </p>
                                </div>
                                <button onClick={() => handleDeleteIncome(income)}>
                                    <Trash2 size={18} className="text-red-500" />
                                </button>
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-lg text-gray-800">{formatCurrency(income.amount)}</p>
                                    <p className="text-gray-500 text-xs">per {income.frequency.replace("-", " ")}</p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded text-right">
                                    <p className="text-xs text-gray-500">Monthly</p>
                                    <p className="font-semibold">{formatCurrency(convertToMonthly(income.amount, income.frequency))}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Income Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 overflow-auto">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Add Income</h2>
                            <button onClick={() => setShowAddModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <label className="font-semibold">Income Name *</label>
                            <input
                                className="border rounded p-2 w-full"
                                placeholder="e.g., Main Job Salary"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />

                            <label className="font-semibold">Type *</label>
                            <div className="flex flex-wrap gap-2">
                                {INCOME_TYPES.map(type => (
                                    <button
                                        key={type.value}
                                        onClick={() => setFormData({ ...formData, type: type.value })}
                                        className={`px-3 py-1 border rounded ${formData.type === type.value ? 'bg-indigo-600 text-white' : ''}`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>

                            <label className="font-semibold">Amount (£) *</label>
                            <input
                                type="number"
                                className="border rounded p-2 w-full"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            />

                            <label className="font-semibold">Frequency *</label>
                            <div className="flex flex-wrap gap-2">
                                {FREQUENCIES.map(freq => (
                                    <button
                                        key={freq.value}
                                        onClick={() => setFormData({ ...formData, frequency: freq.value })}
                                        className={`px-3 py-1 border rounded ${formData.frequency === freq.value ? 'bg-indigo-600 text-white' : ''}`}
                                    >
                                        {freq.label}
                                    </button>
                                ))}
                            </div>

                            <label className="font-semibold">Payment Day (1-31)</label>
                            <input
                                type="number"
                                className="border rounded p-2 w-full"
                                placeholder="1"
                                value={formData.paymentDay}
                                onChange={e => setFormData({ ...formData, paymentDay: e.target.value })}
                            />
                            <p className="text-xs text-gray-500 italic">Day of the month when income is received</p>

                            <button
                                onClick={handleAddIncome}
                                className="bg-indigo-600 text-white w-full py-2 rounded mt-4"
                            >
                                Add Income
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* UC Modal */}
            {showUCModal && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 overflow-auto">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Universal Credit Settings</h2>
                            <button onClick={() => setShowUCModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex gap-2 bg-blue-50 p-4 rounded">
                                <Info size={20} className="text-blue-500" />
                                <p className="text-sm text-gray-700">
                                    Your UC will be automatically adjusted based on earnings. £404 work allowance with 55% taper rate.
                                </p>
                            </div>

                            <label className="font-semibold">Base UC Amount (£/month) *</label>
                            <input
                                type="number"
                                className="border rounded p-2 w-full"
                                placeholder="0.00"
                                value={ucFormData.baseAmount}
                                onChange={e => setUCFormData({ ...ucFormData, baseAmount: e.target.value })}
                            />

                            <label className="font-semibold">Payment Day (1-31)</label>
                            <input
                                type="number"
                                className="border rounded p-2 w-full"
                                placeholder="1"
                                value={ucFormData.paymentDay}
                                onChange={e => setUCFormData({ ...ucFormData, paymentDay: e.target.value })}
                            />
                            <p className="text-xs text-gray-500 italic">Day of the month when UC is received</p>

                            <button
                                onClick={handleSaveUC}
                                className="bg-indigo-600 text-white w-full py-2 rounded mt-4"
                            >
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
