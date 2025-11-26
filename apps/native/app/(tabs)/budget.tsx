import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from "react-native";
import { useState } from "react";
import { useDebtSnowball } from "@/contexts/DebtSnowballContext";
import Colors from "@/constants/colors";
import { formatCurrency } from "@/utils/calculations";
import { Plus, X, Trash2, TrendingUp, TrendingDown, DollarSign } from "lucide-react-native";
import type { ExpenseCategory, ExpensePriority, ExpenseFrequency } from "@/types/expense";

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; priority: ExpensePriority }[] = [
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

const FREQUENCIES: { value: ExpenseFrequency; label: string }[] = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annually', label: 'Annually' },
];

export default function BudgetScreen() {
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

    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);

    const [formData, setFormData] = useState<{
        name: string;
        category: ExpenseCategory;
        amount: string;
        frequency: ExpenseFrequency;
        priority: ExpensePriority;
        dueDate: string;
    }>({
        name: '',
        category: 'food',
        amount: '',
        frequency: 'monthly',
        priority: 'essential',
        dueDate: '',
    });

    const [emergencyAmount, setEmergencyAmount] = useState<string>(babySteps.emergencyFundBalance.toString());

    const handleAddExpense = async () => {
        if (!formData.name || !formData.amount) {
            Alert.alert('Missing Fields', 'Please fill in all required fields');
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
            Alert.alert('Invalid Amount', 'Please enter a valid amount');
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
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading budget...</Text>
            </View>
        );
    }

    return (
        <>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Budget Overview</Text>
                        <Text style={styles.headerSubtitle}>Monthly breakdown</Text>
                    </View>
                    <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
                        <Plus size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.summaryCards}>
                    <View style={styles.summaryCard}>
                        <TrendingUp size={20} color={Colors.light.income} />
                        <Text style={styles.summaryLabel}>Income</Text>
                        <Text style={[styles.summaryAmount, { color: Colors.light.income }]}>
                            {formatCurrency(totalMonthlyIncome)}
                        </Text>
                    </View>

                    <View style={styles.summaryCard}>
                        <TrendingDown size={20} color={Colors.light.expense} />
                        <Text style={styles.summaryLabel}>Expenses</Text>
                        <Text style={[styles.summaryAmount, { color: Colors.light.expense }]}>
                            {formatCurrency(totalMonthlyExpenses)}
                        </Text>
                    </View>

                    <View style={styles.summaryCard}>
                        <DollarSign size={20} color={Colors.light.debt} />
                        <Text style={styles.summaryLabel}>Debt Payments</Text>
                        <Text style={[styles.summaryAmount, { color: Colors.light.debt }]}>
                            {formatCurrency(minimumPayments)}
                        </Text>
                    </View>
                </View>

                <View style={[
                    styles.discretionaryCard,
                    budgetHealth === 'positive' ? styles.discretionaryCardPositive : styles.discretionaryCardNegative
                ]}>
                    <Text style={styles.discretionaryLabel}>
                        {budgetHealth === 'positive' ? 'Available for Extra Debt Payments' : 'Budget Shortfall'}
                    </Text>
                    <Text style={[
                        styles.discretionaryAmount,
                        { color: budgetHealth === 'positive' ? Colors.light.success : Colors.light.danger }
                    ]}>
                        {formatCurrency(Math.abs(monthlyDiscretionary))}
                    </Text>
                    {budgetHealth === 'negative' && (
                        <Text style={styles.discretionaryWarning}>
                            Review expenses to free up money for debt payments
                        </Text>
                    )}
                </View>

                <View style={styles.emergencyCard}>
                    <View style={styles.emergencyHeader}>
                        <View>
                            <Text style={styles.emergencyTitle}>Emergency Fund</Text>
                            <Text style={styles.emergencySubtitle}>
                                Goal: {formatCurrency(babySteps.step1Target)}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.updateButton}
                            onPress={() => setShowEmergencyModal(true)}
                        >
                            <Text style={styles.updateButtonText}>Update</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.emergencyProgress}>
                        <View style={styles.emergencyProgressBar}>
                            <View
                                style={[
                                    styles.emergencyProgressFill,
                                    { width: `${Math.min((babySteps.emergencyFundBalance / babySteps.step1Target) * 100, 100)}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.emergencyAmount}>
                            {formatCurrency(babySteps.emergencyFundBalance)}
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Essential Expenses ({essentialExpenses.length})</Text>
                    {essentialExpenses.length === 0 ? (
                        <Text style={styles.emptyText}>No essential expenses added yet</Text>
                    ) : (
                        essentialExpenses.map((expense) => (
                            <View key={expense.id} style={styles.expenseCard}>
                                <View style={styles.expenseHeader}>
                                    <View style={styles.expenseHeaderLeft}>
                                        <Text style={styles.expenseName}>{expense.name}</Text>
                                        <Text style={styles.expenseCategory}>
                                            {EXPENSE_CATEGORIES.find(c => c.value === expense.category)?.label}
                                            {expense.dueDate && ` • Due day ${expense.dueDate}`}
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => {
                                        Alert.alert(
                                            'Delete Expense',
                                            `Delete ${expense.name}?`,
                                            [
                                                { text: 'Cancel', style: 'cancel' },
                                                { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(expense.id) },
                                            ]
                                        );
                                    }}>
                                        <Trash2 size={18} color={Colors.light.danger} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.expenseAmount}>
                                    {formatCurrency(expense.amount)} / {expense.frequency}
                                </Text>
                            </View>
                        ))
                    )}
                </View>

                {nonEssentialExpenses.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Non-Essential Expenses ({nonEssentialExpenses.length})</Text>
                        {nonEssentialExpenses.map((expense) => (
                            <View key={expense.id} style={styles.expenseCard}>
                                <View style={styles.expenseHeader}>
                                    <View style={styles.expenseHeaderLeft}>
                                        <Text style={styles.expenseName}>{expense.name}</Text>
                                        <Text style={styles.expenseCategory}>
                                            {EXPENSE_CATEGORIES.find(c => c.value === expense.category)?.label}
                                            {expense.dueDate && ` • Due day ${expense.dueDate}`}
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => {
                                        Alert.alert(
                                            'Delete Expense',
                                            `Delete ${expense.name}?`,
                                            [
                                                { text: 'Cancel', style: 'cancel' },
                                                { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(expense.id) },
                                            ]
                                        );
                                    }}>
                                        <Trash2 size={18} color={Colors.light.danger} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.expenseAmount}>
                                    {formatCurrency(expense.amount)} / {expense.frequency}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            <Modal
                visible={showAddModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowAddModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add Expense</Text>
                        <TouchableOpacity onPress={() => setShowAddModal(false)}>
                            <X size={24} color={Colors.light.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.inputLabel}>Expense Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder="e.g., Rent"
                            placeholderTextColor={Colors.light.textTertiary}
                        />

                        <Text style={styles.inputLabel}>Category *</Text>
                        <View style={styles.typeGrid}>
                            {EXPENSE_CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat.value}
                                    style={[
                                        styles.typeButton,
                                        formData.category === cat.value && styles.typeButtonActive,
                                    ]}
                                    onPress={() => setFormData({ ...formData, category: cat.value, priority: cat.priority })}
                                >
                                    <Text style={[
                                        styles.typeButtonText,
                                        formData.category === cat.value && styles.typeButtonTextActive,
                                    ]}>
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.inputLabel}>Amount (£) *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.amount}
                            onChangeText={(text) => setFormData({ ...formData, amount: text })}
                            placeholder="0.00"
                            keyboardType="decimal-pad"
                            placeholderTextColor={Colors.light.textTertiary}
                        />

                        <Text style={styles.inputLabel}>Frequency *</Text>
                        <View style={styles.typeGrid}>
                            {FREQUENCIES.map(freq => (
                                <TouchableOpacity
                                    key={freq.value}
                                    style={[
                                        styles.typeButton,
                                        formData.frequency === freq.value && styles.typeButtonActive,
                                    ]}
                                    onPress={() => setFormData({ ...formData, frequency: freq.value })}
                                >
                                    <Text style={[
                                        styles.typeButtonText,
                                        formData.frequency === freq.value && styles.typeButtonTextActive,
                                    ]}>
                                        {freq.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.inputLabel}>Due Day (1-31)</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.dueDate}
                            onChangeText={(text) => setFormData({ ...formData, dueDate: text })}
                            placeholder="e.g., 15 (15th of month)"
                            keyboardType="number-pad"
                            placeholderTextColor={Colors.light.textTertiary}
                        />
                        <Text style={styles.helperText}>Day of the month when bill is due</Text>

                        <TouchableOpacity style={styles.submitButton} onPress={handleAddExpense}>
                            <Text style={styles.submitButtonText}>Add Expense</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>

            <Modal
                visible={showEmergencyModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowEmergencyModal(false)}
            >
                <View style={styles.paymentModalOverlay}>
                    <View style={styles.paymentModalContent}>
                        <Text style={styles.paymentModalTitle}>Update Emergency Fund</Text>
                        <Text style={styles.paymentModalSubtitle}>
                            Current balance: {formatCurrency(babySteps.emergencyFundBalance)}
                        </Text>

                        <Text style={styles.inputLabel}>New Balance (£)</Text>
                        <TextInput
                            style={styles.input}
                            value={emergencyAmount}
                            onChangeText={setEmergencyAmount}
                            placeholder="0.00"
                            keyboardType="decimal-pad"
                            placeholderTextColor={Colors.light.textTertiary}
                            autoFocus
                        />

                        <View style={styles.paymentModalButtons}>
                            <TouchableOpacity
                                style={styles.paymentModalButtonCancel}
                                onPress={() => setShowEmergencyModal(false)}
                            >
                                <Text style={styles.paymentModalButtonCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.paymentModalButtonSubmit}
                                onPress={handleSaveEmergencyFund}
                            >
                                <Text style={styles.paymentModalButtonSubmitText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
    },
    loadingText: {
        fontSize: 16,
        color: Colors.light.textSecondary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700' as const,
        color: Colors.light.text,
    },
    headerSubtitle: {
        fontSize: 15,
        color: Colors.light.textSecondary,
        marginTop: 2,
    },
    addButton: {
        backgroundColor: Colors.light.tint,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryCards: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: Colors.light.card,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.light.border,
        gap: 8,
    },
    summaryLabel: {
        fontSize: 11,
        color: Colors.light.textSecondary,
    },
    summaryAmount: {
        fontSize: 18,
        fontWeight: '700' as const,
    },
    discretionaryCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center' as const,
    },
    discretionaryCardPositive: {
        backgroundColor: Colors.light.successLight,
    },
    discretionaryCardNegative: {
        backgroundColor: Colors.light.dangerLight,
    },
    discretionaryLabel: {
        fontSize: 13,
        fontWeight: '600' as const,
        letterSpacing: 0.5,
        marginBottom: 8,
        textAlign: 'center' as const,
    },
    discretionaryAmount: {
        fontSize: 32,
        fontWeight: '700' as const,
    },
    discretionaryWarning: {
        fontSize: 13,
        color: Colors.light.textSecondary,
        marginTop: 8,
        textAlign: 'center' as const,
    },
    emergencyCard: {
        backgroundColor: Colors.light.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    emergencyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    emergencyTitle: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: Colors.light.text,
    },
    emergencySubtitle: {
        fontSize: 13,
        color: Colors.light.textSecondary,
        marginTop: 2,
    },
    updateButton: {
        backgroundColor: Colors.light.tint,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    updateButtonText: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: '#FFF',
    },
    emergencyProgress: {
        gap: 8,
    },
    emergencyProgressBar: {
        height: 8,
        backgroundColor: Colors.light.successLight,
        borderRadius: 4,
        overflow: 'hidden',
    },
    emergencyProgressFill: {
        height: '100%',
        backgroundColor: Colors.light.success,
    },
    emergencyAmount: {
        fontSize: 20,
        fontWeight: '700' as const,
        color: Colors.light.success,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600' as const,
        color: Colors.light.text,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        fontStyle: 'italic' as const,
    },
    expenseCard: {
        backgroundColor: Colors.light.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    expenseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    expenseHeaderLeft: {
        flex: 1,
    },
    expenseName: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: Colors.light.text,
        marginBottom: 2,
    },
    expenseCategory: {
        fontSize: 12,
        color: Colors.light.textSecondary,
    },
    expenseAmount: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: Colors.light.expense,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
        backgroundColor: Colors.light.backgroundSecondary,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700' as const,
        color: Colors.light.text,
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: Colors.light.text,
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: Colors.light.backgroundSecondary,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: Colors.light.text,
    },
    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    typeButton: {
        backgroundColor: Colors.light.backgroundSecondary,
        borderWidth: 1,
        borderColor: Colors.light.border,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    typeButtonActive: {
        backgroundColor: Colors.light.tint,
        borderColor: Colors.light.tint,
    },
    typeButtonText: {
        fontSize: 13,
        color: Colors.light.text,
    },
    typeButtonTextActive: {
        color: '#FFF',
        fontWeight: '600' as const,
    },
    submitButton: {
        backgroundColor: Colors.light.tint,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center' as const,
        marginTop: 24,
        marginBottom: 32,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: '#FFF',
    },
    paymentModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    paymentModalContent: {
        backgroundColor: Colors.light.backgroundSecondary,
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    paymentModalTitle: {
        fontSize: 20,
        fontWeight: '700' as const,
        color: Colors.light.text,
        marginBottom: 4,
    },
    paymentModalSubtitle: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        marginBottom: 16,
    },
    paymentModalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    paymentModalButtonCancel: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.light.border,
        alignItems: 'center' as const,
    },
    paymentModalButtonCancelText: {
        fontSize: 15,
        fontWeight: '600' as const,
        color: Colors.light.text,
    },
    paymentModalButtonSubmit: {
        flex: 1,
        backgroundColor: Colors.light.tint,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center' as const,
    },
    paymentModalButtonSubmitText: {
        fontSize: 15,
        fontWeight: '600' as const,
        color: '#FFF',
    },
    helperText: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        marginTop: 4,
        fontStyle: 'italic' as const,
    },
});
