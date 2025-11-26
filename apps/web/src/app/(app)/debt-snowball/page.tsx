// app/(tabs)/snowball/page.tsx
"use client";

import { useState } from "react";
import { useDebtSnowball } from "@/contexts/DebtSnowballContext";
import { formatCurrency, formatDate } from "@/lib/calculations";
import { Plus, AlertTriangle, Target, X, Trash2, Check } from "lucide-react";

const DEBT_TYPES = [
    { value: 'ccj', label: 'CCJ (County Court Judgment)' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'personal_loan', label: 'Personal Loan' },
    { value: 'overdraft', label: 'Overdraft' },
    { value: 'bnpl', label: 'Buy Now Pay Later' },
    { value: 'car_finance', label: 'Car Finance' },
    { value: 'payday_loan', label: 'Payday Loan' },
    { value: 'store_card', label: 'Store Card' },
    { value: 'mortgage', label: 'Mortgage' },
];

export default function SnowballPage() {
    const { debts, addDebt, deleteDebt, addDebtPayment, snowballPlan, debtFreeDate, isLoading } = useDebtSnowball();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        type: 'credit_card',
        balance: '',
        interestRate: '',
        minimumPayment: '',
        creditor: '',
        isCCJ: false,
        paymentDay: '',
    });

    const [paymentAmount, setPaymentAmount] = useState('');

    const activeDebts = debts.filter(d => d.status === 'active');
    const paidDebts = debts.filter(d => d.status === 'paid_off');

    const handleAddDebt = async () => {
        if (!formData.name || !formData.balance || !formData.minimumPayment) {
            alert('Please fill in all required fields');
            return;
        }

        await addDebt({
            name: formData.name,
            type: formData.type,
            balance: parseFloat(formData.balance),
            interestRate: parseFloat(formData.interestRate) || 0,
            minimumPayment: parseFloat(formData.minimumPayment),
            creditor: formData.creditor,
            isCCJ: formData.type === 'ccj',
            paymentDay: formData.paymentDay ? parseInt(formData.paymentDay) : undefined,
        });

        setFormData({
            name: '',
            type: 'credit_card',
            balance: '',
            interestRate: '',
            minimumPayment: '',
            creditor: '',
            isCCJ: false,
            paymentDay: '',
        });
        setShowAddModal(false);
    };

    const handleDeleteDebt = (debt) => {
        if (confirm(`Delete ${debt.name}?`)) {
            deleteDebt(debt.id);
        }
    };

    const handleMakePayment = async () => {
        if (!selectedDebt || !paymentAmount) return;

        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid payment amount');
            return;
        }

        const willBePaidOff = selectedDebt.balance - amount <= 0;

        await addDebtPayment(selectedDebt.id, amount);

        if (willBePaidOff) {
            setTimeout(() => {
                alert(`🎉 Debt Paid Off!\nCongratulations! You've completely paid off ${selectedDebt.name}!`);
            }, 300);
        }

        setPaymentAmount('');
        setSelectedDebt(null);
        setShowPaymentModal(false);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen text-gray-500">
                Loading debts...
            </div>
        );
    }

    return (
        <div className="p-6">
            {activeDebts.length === 0 ? (
                <div className="flex flex-col items-center pt-16">
                    <div className="text-8xl mb-4">❄️</div>
                    <h2 className="text-2xl font-bold mb-2">No Debts Yet</h2>
                    <p className="text-gray-500 text-center mb-6">Add your debts to see your snowball plan and debt-free date!</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-md flex items-center gap-2"
                    >
                        <Plus size={24} /> Add Your First Debt
                    </button>
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold">Debt Snowball</h1>
                            <p className="text-gray-500">{activeDebts.length} {activeDebts.length === 1 ? 'debt' : 'debts'} remaining</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-indigo-600 p-2 rounded-full flex items-center justify-center"
                        >
                            <Plus size={20} className="text-white" />
                        </button>
                    </div>

                    {/* Debt-Free Date */}
                    {debtFreeDate && (
                        <div className="bg-green-100 rounded-lg p-6 mb-6 text-center">
                            <p className="text-green-600 font-semibold">Debt-Free Date</p>
                            <h2 className="text-2xl font-bold text-green-700">{formatDate(debtFreeDate)}</h2>
                            <p className="text-gray-500">Keep up the momentum!</p>
                        </div>
                    )}

                    {/* Snowball Plan */}
                    <div className="mb-6">
                        <h2 className="text-xl font-bold mb-1">Your Snowball Plan</h2>
                        <p className="text-gray-500 mb-4">Attack the smallest debt first with extra payments</p>

                        {snowballPlan.map((plan) => {
                            const debt = debts.find(d => d.id === plan.debtId);
                            if (!debt) return null;

                            return (
                                <div
                                    key={plan.debtId}
                                    className={`border rounded-lg p-4 mb-4 ${debt.isCCJ ? 'border-red-500 bg-red-50' : plan.isTarget ? 'border-indigo-600' : 'border-gray-200'}`}
                                >
                                    {/* Badges */}
                                    {debt.isCCJ && (
                                        <div className="flex items-center gap-1 bg-red-500 text-white text-xs px-2 py-1 rounded mb-2">
                                            <AlertTriangle size={14} />
                                            PRIORITY - CCJ
                                        </div>
                                    )}
                                    {plan.isTarget && !debt.isCCJ && (
                                        <div className="flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded mb-2">
                                            <Target size={14} />
                                            ATTACK THIS ONE
                                        </div>
                                    )}

                                    {/* Debt Info */}
                                    <div className="flex justify-between mb-2">
                                        <div>
                                            <h3 className="font-semibold">{debt.name}</h3>
                                            <p className="text-gray-500 text-sm">{DEBT_TYPES.find(t => t.value === debt.type)?.label || debt.type}{debt.paymentDay && ` • Due day ${debt.paymentDay}`}</p>
                                        </div>
                                        <button onClick={() => handleDeleteDebt(debt)}>
                                            <Trash2 size={18} className="text-red-500" />
                                        </button>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex gap-4 mb-2">
                                        <div className="flex-1 bg-gray-100 p-2 rounded">
                                            <p className="text-xs text-gray-500">Balance</p>
                                            <p className="font-semibold">{formatCurrency(plan.currentBalance)}</p>
                                        </div>
                                        <div className="flex-1 bg-gray-100 p-2 rounded">
                                            <p className="text-xs text-gray-500">This Month</p>
                                            <p className={`font-semibold ${plan.isTarget ? 'text-green-600' : ''}`}>{formatCurrency(plan.monthlyPayment)}</p>
                                        </div>
                                        <div className="flex-1 bg-gray-100 p-2 rounded">
                                            <p className="text-xs text-gray-500">APR</p>
                                            <p className="font-semibold">{debt.interestRate.toFixed(1)}%</p>
                                        </div>
                                    </div>

                                    {plan.isTarget && (
                                        <button
                                            onClick={() => { setSelectedDebt(debt); setShowPaymentModal(true); }}
                                            className="bg-indigo-600 text-white w-full py-2 rounded mt-2"
                                        >
                                            Make Payment
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Paid Off Debts */}
                    {paidDebts.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold mb-2">🎉 Paid Off Debts</h2>
                            {paidDebts.map(debt => (
                                <div key={debt.id} className="border border-green-100 rounded-lg p-4 mb-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-semibold text-green-600">{debt.name}</h3>
                                        <Check size={20} className="text-green-600" />
                                    </div>
                                    {debt.paidOffDate && <p className="text-gray-500 text-sm">Paid off {formatDate(new Date(debt.paidOffDate))}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Add Debt Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg overflow-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Add Debt</h2>
                            <button onClick={() => setShowAddModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="font-semibold">Debt Name *</label>
                            <input className="border p-2 rounded w-full" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />

                            <label className="font-semibold">Debt Type *</label>
                            <div className="flex flex-wrap gap-2">
                                {DEBT_TYPES.map(type => (
                                    <button
                                        key={type.value}
                                        onClick={() => setFormData({ ...formData, type: type.value, isCCJ: type.value === 'ccj' })}
                                        className={`px-3 py-1 border rounded ${formData.type === type.value ? 'bg-indigo-600 text-white' : ''}`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>

                            <label className="font-semibold">Current Balance (£) *</label>
                            <input type="number" className="border p-2 rounded w-full" value={formData.balance} onChange={e => setFormData({ ...formData, balance: e.target.value })} />

                            <label className="font-semibold">Interest Rate (% APR)</label>
                            <input type="number" className="border p-2 rounded w-full" value={formData.interestRate} onChange={e => setFormData({ ...formData, interestRate: e.target.value })} />

                            <label className="font-semibold">Minimum Payment (£) *</label>
                            <input type="number" className="border p-2 rounded w-full" value={formData.minimumPayment} onChange={e => setFormData({ ...formData, minimumPayment: e.target.value })} />

                            <label className="font-semibold">Creditor Name</label>
                            <input type="text" className="border p-2 rounded w-full" value={formData.creditor} onChange={e => setFormData({ ...formData, creditor: e.target.value })} />

                            <label className="font-semibold">Payment Due Day (1-31)</label>
                            <input type="number" className="border p-2 rounded w-full" value={formData.paymentDay} onChange={e => setFormData({ ...formData, paymentDay: e.target.value })} />

                            <button onClick={handleAddDebt} className="bg-indigo-600 text-white w-full py-2 rounded mt-4">Add Debt</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && selectedDebt && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-2">Make Payment</h2>
                        <p className="text-gray-600 mb-1">{selectedDebt.name}</p>
                        <p className="text-gray-500 mb-4">Current Balance: {formatCurrency(selectedDebt.balance)}</p>

                        <input type="number" className="border p-2 rounded w-full mb-4" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} />

                        <div className="flex gap-2">
                            <button className="flex-1 border p-2 rounded" onClick={() => { setShowPaymentModal(false); setPaymentAmount(''); }}>Cancel</button>
                            <button className="flex-1 bg-indigo-600 text-white p-2 rounded" onClick={handleMakePayment}>Submit Payment</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
