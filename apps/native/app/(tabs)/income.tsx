import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from "react-native";
import { useState } from "react";
import { useDebtSnowball } from "@/contexts/DebtSnowballContext";
import Colors from "@/constants/colors";
import { formatCurrency, convertToMonthly, calculateUC } from "@/utils/calculations";
import { Plus, X, Trash2, TrendingUp, Info } from "lucide-react-native";
import type { Income, IncomeType, IncomeFrequency } from "@/types/income";

const INCOME_TYPES: { value: IncomeType; label: string }[] = [
    { value: 'wages', label: 'Wages/Salary' },
    { value: 'side_project', label: 'Side Projects' },
    { value: 'self_employment', label: 'Self-Employment' },
    { value: 'universal_credit', label: 'Universal Credit' },
    { value: 'benefits', label: 'Other Benefits' },
    { value: 'rental', label: 'Rental Income' },
    { value: 'other', label: 'Other' },
];

const FREQUENCIES: { value: IncomeFrequency; label: string }[] = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'fortnightly', label: 'Fortnightly' },
    { value: '4-weekly', label: '4-Weekly' },
    { value: 'monthly', label: 'Monthly' },
];

export default function IncomeScreen() {
    const { incomes, addIncome, deleteIncome, ucSettings, updateUCSettings, totalMonthlyIncome, isLoading } = useDebtSnowball();
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [showUCModal, setShowUCModal] = useState<boolean>(false);

    const [formData, setFormData] = useState<{
        name: string;
        type: IncomeType;
        amount: string;
        frequency: IncomeFrequency;
        isNet: boolean;
        paymentDay: string;
    }>({
        name: '',
        type: 'wages',
        amount: '',
        frequency: 'monthly',
        isNet: true,
        paymentDay: '',
    });

    const [ucFormData, setUCFormData] = useState<{
        baseAmount: string;
        housingIncluded: boolean;
        paymentDay: string;
    }>({
        baseAmount: ucSettings?.baseAmount.toString() || '',
        housingIncluded: ucSettings?.housingIncluded || false,
        paymentDay: ucSettings?.paymentDay.toString() || '1',
    });

    const handleAddIncome = async () => {
        if (!formData.name || !formData.amount) {
            Alert.alert('Missing Fields', 'Please fill in all required fields');
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

        setFormData({
            name: '',
            type: 'wages',
            amount: '',
            frequency: 'monthly',
            isNet: true,
            paymentDay: '',
        });
        setShowAddModal(false);
    };

    const handleSaveUC = async () => {
        if (!ucFormData.baseAmount) {
            Alert.alert('Missing Field', 'Please enter your Universal Credit base amount');
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

    const handleDeleteIncome = (income: Income) => {
        Alert.alert(
            'Delete Income',
            `Delete ${income.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteIncome(income.id) },
            ]
        );
    };

    const totalEarnedIncome = incomes
        .filter(i => i.type === 'wages' || i.type === 'side_project' || i.type === 'self_employment')
        .reduce((sum, i) => sum + convertToMonthly(i.amount, i.frequency), 0);

    const adjustedUC = ucSettings ? calculateUC(ucSettings.baseAmount, totalEarnedIncome) : 0;

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading income...</Text>
            </View>
        );
    }

    return (
        <>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Income</Text>
                        <Text style={styles.headerSubtitle}>Track all your income sources</Text>
                    </View>
                    <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
                        <Plus size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.totalCard}>
                    <Text style={styles.totalLabel}>Total Monthly Income</Text>
                    <Text style={styles.totalAmount}>{formatCurrency(totalMonthlyIncome)}</Text>
                    <View style={styles.totalBreakdown}>
                        <Text style={styles.totalBreakdownText}>
                            {incomes.length} income {incomes.length === 1 ? 'source' : 'sources'}
                        </Text>
                    </View>
                </View>

                {ucSettings && (
                    <View style={styles.ucCard}>
                        <View style={styles.ucHeader}>
                            <View style={styles.ucHeaderLeft}>
                                <Text style={styles.ucTitle}>Universal Credit</Text>
                                <Text style={styles.ucSubtitle}>Automatically adjusted for earnings</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowUCModal(true)}>
                                <Info size={20} color={Colors.light.info} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.ucStats}>
                            <View style={styles.ucStat}>
                                <Text style={styles.ucStatLabel}>Base Amount</Text>
                                <Text style={styles.ucStatValue}>{formatCurrency(ucSettings.baseAmount)}</Text>
                            </View>
                            <View style={styles.ucStat}>
                                <Text style={styles.ucStatLabel}>Adjusted UC</Text>
                                <Text style={styles.ucStatValue}>{formatCurrency(adjustedUC)}</Text>
                            </View>
                        </View>
                        {totalEarnedIncome > 404 && (
                            <Text style={styles.ucNote}>
                                £{((totalEarnedIncome - 404) * 0.55).toFixed(0)} deducted due to earnings over work allowance
                            </Text>
                        )}
                    </View>
                )}

                {!ucSettings && (
                    <TouchableOpacity style={styles.setupUCButton} onPress={() => setShowUCModal(true)}>
                        <Text style={styles.setupUCButtonText}>+ Set Up Universal Credit</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Income Sources</Text>
                    {incomes.length === 0 ? (
                        <View style={styles.emptyState}>
                            <TrendingUp size={48} color={Colors.light.textTertiary} />
                            <Text style={styles.emptyText}>No income sources yet</Text>
                            <Text style={styles.emptySubtext}>Add your first income source to get started</Text>
                        </View>
                    ) : (
                        incomes.map((income) => (
                            <View key={income.id} style={styles.incomeCard}>
                                <View style={styles.incomeHeader}>
                                    <View style={styles.incomeHeaderLeft}>
                                        <Text style={styles.incomeName}>{income.name}</Text>
                                        <Text style={styles.incomeType}>
                                            {INCOME_TYPES.find(t => t.value === income.type)?.label} • {FREQUENCIES.find(f => f.value === income.frequency)?.label}
                                            {income.paymentDay && ` • Day ${income.paymentDay}`}
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleDeleteIncome(income)}>
                                        <Trash2 size={18} color={Colors.light.danger} />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.incomeAmounts}>
                                    <View>
                                        <Text style={styles.incomeAmount}>{formatCurrency(income.amount)}</Text>
                                        <Text style={styles.incomeFrequency}>per {income.frequency.replace('-', ' ')}</Text>
                                    </View>
                                    <View style={styles.monthlyBadge}>
                                        <Text style={styles.monthlyBadgeLabel}>Monthly</Text>
                                        <Text style={styles.monthlyBadgeAmount}>
                                            {formatCurrency(convertToMonthly(income.amount, income.frequency))}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            <Modal
                visible={showAddModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowAddModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add Income</Text>
                        <TouchableOpacity onPress={() => setShowAddModal(false)}>
                            <X size={24} color={Colors.light.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.inputLabel}>Income Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder="e.g., Main Job Salary"
                            placeholderTextColor={Colors.light.textTertiary}
                        />

                        <Text style={styles.inputLabel}>Type *</Text>
                        <View style={styles.typeGrid}>
                            {INCOME_TYPES.map(type => (
                                <TouchableOpacity
                                    key={type.value}
                                    style={[
                                        styles.typeButton,
                                        formData.type === type.value && styles.typeButtonActive,
                                    ]}
                                    onPress={() => setFormData({ ...formData, type: type.value })}
                                >
                                    <Text style={[
                                        styles.typeButtonText,
                                        formData.type === type.value && styles.typeButtonTextActive,
                                    ]}>
                                        {type.label}
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

                        <Text style={styles.inputLabel}>Payment Day (1-31)</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.paymentDay}
                            onChangeText={(text) => setFormData({ ...formData, paymentDay: text })}
                            placeholder="e.g., 1 (1st of month)"
                            keyboardType="number-pad"
                            placeholderTextColor={Colors.light.textTertiary}
                        />
                        <Text style={styles.helperText}>Day of the month when income is received</Text>

                        <TouchableOpacity style={styles.submitButton} onPress={handleAddIncome}>
                            <Text style={styles.submitButtonText}>Add Income</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>

            <Modal
                visible={showUCModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowUCModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Universal Credit Settings</Text>
                        <TouchableOpacity onPress={() => setShowUCModal(false)}>
                            <X size={24} color={Colors.light.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.infoBox}>
                            <Info size={20} color={Colors.light.info} />
                            <Text style={styles.infoText}>
                                Your UC will be automatically adjusted based on earnings. £404 work allowance with 55% taper rate.
                            </Text>
                        </View>

                        <Text style={styles.inputLabel}>Base UC Amount (£/month) *</Text>
                        <TextInput
                            style={styles.input}
                            value={ucFormData.baseAmount}
                            onChangeText={(text) => setUCFormData({ ...ucFormData, baseAmount: text })}
                            placeholder="0.00"
                            keyboardType="decimal-pad"
                            placeholderTextColor={Colors.light.textTertiary}
                        />

                        <Text style={styles.inputLabel}>Payment Day (1-31)</Text>
                        <TextInput
                            style={styles.input}
                            value={ucFormData.paymentDay}
                            onChangeText={(text) => setUCFormData({ ...ucFormData, paymentDay: text })}
                            placeholder="1"
                            keyboardType="number-pad"
                            placeholderTextColor={Colors.light.textTertiary}
                        />
                        <Text style={styles.helperText}>Day of the month when UC is received</Text>

                        <TouchableOpacity style={styles.submitButton} onPress={handleSaveUC}>
                            <Text style={styles.submitButtonText}>Save Settings</Text>
                        </TouchableOpacity>
                    </ScrollView>
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
    totalCard: {
        backgroundColor: Colors.light.successLight,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center' as const,
    },
    totalLabel: {
        fontSize: 13,
        fontWeight: '600' as const,
        color: Colors.light.success,
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    totalAmount: {
        fontSize: 36,
        fontWeight: '700' as const,
        color: Colors.light.success,
        marginBottom: 8,
    },
    totalBreakdown: {
        flexDirection: 'row',
        gap: 8,
    },
    totalBreakdownText: {
        fontSize: 13,
        color: Colors.light.textSecondary,
    },
    ucCard: {
        backgroundColor: Colors.light.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    ucHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    ucHeaderLeft: {
        flex: 1,
    },
    ucTitle: {
        fontSize: 18,
        fontWeight: '600' as const,
        color: Colors.light.text,
        marginBottom: 4,
    },
    ucSubtitle: {
        fontSize: 13,
        color: Colors.light.textSecondary,
    },
    ucStats: {
        flexDirection: 'row',
        gap: 12,
    },
    ucStat: {
        flex: 1,
        backgroundColor: Colors.light.background,
        padding: 12,
        borderRadius: 8,
    },
    ucStatLabel: {
        fontSize: 11,
        color: Colors.light.textSecondary,
        marginBottom: 4,
    },
    ucStatValue: {
        fontSize: 16,
        fontWeight: '700' as const,
        color: Colors.light.text,
    },
    ucNote: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        marginTop: 8,
        fontStyle: 'italic' as const,
    },
    setupUCButton: {
        backgroundColor: Colors.light.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.light.border,
        alignItems: 'center' as const,
    },
    setupUCButtonText: {
        fontSize: 15,
        fontWeight: '600' as const,
        color: Colors.light.tint,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700' as const,
        color: Colors.light.text,
        marginBottom: 16,
    },
    emptyState: {
        alignItems: 'center' as const,
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: Colors.light.text,
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        marginTop: 4,
    },
    incomeCard: {
        backgroundColor: Colors.light.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    incomeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    incomeHeaderLeft: {
        flex: 1,
    },
    incomeName: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: Colors.light.text,
        marginBottom: 4,
    },
    incomeType: {
        fontSize: 13,
        color: Colors.light.textSecondary,
    },
    incomeAmounts: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    incomeAmount: {
        fontSize: 20,
        fontWeight: '700' as const,
        color: Colors.light.income,
    },
    incomeFrequency: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        marginTop: 2,
    },
    monthlyBadge: {
        backgroundColor: Colors.light.background,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'flex-end' as const,
    },
    monthlyBadgeLabel: {
        fontSize: 11,
        color: Colors.light.textSecondary,
        marginBottom: 2,
    },
    monthlyBadgeAmount: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: Colors.light.text,
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
    infoBox: {
        flexDirection: 'row',
        backgroundColor: Colors.light.infoLight,
        borderRadius: 12,
        padding: 16,
        gap: 12,
        marginBottom: 16,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: Colors.light.text,
        lineHeight: 18,
    },
    helperText: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        marginTop: 4,
        fontStyle: 'italic' as const,
    },
});
