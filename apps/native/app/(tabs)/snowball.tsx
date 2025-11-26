import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Platform, Alert } from "react-native";
import { useState } from "react";
import * as Haptics from 'expo-haptics';
import { useDebtSnowball } from "@/contexts/DebtSnowballContext";
import Colors from "@/constants/colors";
import { formatCurrency, formatDate } from "@/utils/calculations";
import { Plus, AlertTriangle, Target, X, Trash2, Check } from "lucide-react-native";
import type { Debt, DebtType } from "@/types/debt";

const DEBT_TYPES: { value: DebtType; label: string; }[] = [
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

export default function SnowballScreen() {
  const { debts, addDebt, deleteDebt, addDebtPayment, snowballPlan, debtFreeDate, isLoading } = useDebtSnowball();
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    type: DebtType;
    balance: string;
    interestRate: string;
    minimumPayment: string;
    creditor: string;
    isCCJ: boolean;
    paymentDay: string;
  }>({
    name: '',
    type: 'credit_card',
    balance: '',
    interestRate: '',
    minimumPayment: '',
    creditor: '',
    isCCJ: false,
    paymentDay: '',
  });

  const [paymentAmount, setPaymentAmount] = useState<string>('');

  const activeDebts = debts.filter(d => d.status === 'active');
  const paidDebts = debts.filter(d => d.status === 'paid_off');

  const handleAddDebt = async () => {
    if (!formData.name || !formData.balance || !formData.minimumPayment) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
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

  const handleDeleteDebt = (debt: Debt) => {
    if (Platform.OS === 'web') {
      if (confirm(`Delete ${debt.name}?`)) {
        deleteDebt(debt.id);
      }
    } else {
      Alert.alert(
        'Delete Debt',
        `Are you sure you want to delete ${debt.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deleteDebt(debt.id) },
        ]
      );
    }
  };

  const handleMakePayment = async () => {
    if (!selectedDebt || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount');
      return;
    }

    const willBePaidOff = selectedDebt.balance - amount <= 0;
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    await addDebtPayment(selectedDebt.id, amount);
    
    if (willBePaidOff) {
      setTimeout(() => {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setTimeout(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }, 200);
        }
        Alert.alert(
          '🎉 Debt Paid Off!',
          `Congratulations! You\'ve completely paid off ${selectedDebt.name}! The freed-up payment will now attack your next debt.`,
          [{ text: 'Amazing!', style: 'default' }]
        );
      }, 300);
    }

    setPaymentAmount('');
    setSelectedDebt(null);
    setShowPaymentModal(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading debts...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {activeDebts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>❄️</Text>
            <Text style={styles.emptyTitle}>No Debts Yet</Text>
            <Text style={styles.emptyText}>
              Add your debts to see your snowball plan and debt-free date!
            </Text>
            <TouchableOpacity style={styles.addButtonLarge} onPress={() => setShowAddModal(true)}>
              <Plus size={24} color="#FFF" />
              <Text style={styles.addButtonLargeText}>Add Your First Debt</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Debt Snowball</Text>
                <Text style={styles.headerSubtitle}>
                  {activeDebts.length} {activeDebts.length === 1 ? 'debt' : 'debts'} remaining
                </Text>
              </View>
              <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setShowAddModal(true);
              }}
            >
                <Plus size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            {debtFreeDate && (
              <View style={styles.debtFreeCard}>
                <Text style={styles.debtFreeLabel}>Debt-Free Date</Text>
                <Text style={styles.debtFreeDate}>{formatDate(debtFreeDate)}</Text>
                <Text style={styles.debtFreeSubtext}>Keep up the momentum!</Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Snowball Plan</Text>
              <Text style={styles.sectionSubtitle}>
                Attack the smallest debt first with extra payments
              </Text>

              {snowballPlan.map((plan, index) => {
                const debt = debts.find(d => d.id === plan.debtId);
                if (!debt) return null;

                return (
                  <View
                    key={plan.debtId}
                    style={[
                      styles.debtCard,
                      debt.isCCJ && styles.debtCardCCJ,
                      plan.isTarget && styles.debtCardTarget,
                    ]}
                  >
                    {debt.isCCJ && (
                      <View style={styles.ccjBadge}>
                        <AlertTriangle size={14} color={Colors.light.ccjRed} />
                        <Text style={styles.ccjBadgeText}>PRIORITY - CCJ</Text>
                      </View>
                    )}

                    {plan.isTarget && !debt.isCCJ && (
                      <View style={styles.targetBadge}>
                        <Target size={14} color={Colors.light.success} />
                        <Text style={styles.targetBadgeText}>ATTACK THIS ONE</Text>
                      </View>
                    )}

                    <View style={styles.debtHeader}>
                      <View style={styles.debtHeaderLeft}>
                        <Text style={styles.debtName}>{debt.name}</Text>
                        <Text style={styles.debtType}>
                          {DEBT_TYPES.find(t => t.value === debt.type)?.label || debt.type}
                          {debt.paymentDay && ` • Due day ${debt.paymentDay}`}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteDebt(debt)}
                      >
                        <Trash2 size={18} color={Colors.light.danger} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.debtStats}>
                      <View style={styles.debtStat}>
                        <Text style={styles.debtStatLabel}>Balance</Text>
                        <Text style={styles.debtStatValue}>{formatCurrency(plan.currentBalance)}</Text>
                      </View>
                      <View style={styles.debtStat}>
                        <Text style={styles.debtStatLabel}>This Month</Text>
                        <Text style={[
                          styles.debtStatValue,
                          plan.isTarget && styles.debtStatValueTarget
                        ]}>
                          {formatCurrency(plan.monthlyPayment)}
                        </Text>
                      </View>
                      <View style={styles.debtStat}>
                        <Text style={styles.debtStatLabel}>APR</Text>
                        <Text style={styles.debtStatValue}>{debt.interestRate.toFixed(1)}%</Text>
                      </View>
                    </View>

                    {plan.isTarget && (
                      <TouchableOpacity
                        style={styles.paymentButton}
                        onPress={() => {
                          if (Platform.OS !== 'web') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          }
                          setSelectedDebt(debt);
                          setShowPaymentModal(true);
                        }}
                      >
                        <Text style={styles.paymentButtonText}>Make Payment</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>

            {paidDebts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎉 Paid Off Debts</Text>
                {paidDebts.map(debt => (
                  <View key={debt.id} style={styles.paidDebtCard}>
                    <View style={styles.paidDebtHeader}>
                      <Text style={styles.paidDebtName}>{debt.name}</Text>
                      <Check size={20} color={Colors.light.success} />
                    </View>
                    {debt.paidOffDate && (
                      <Text style={styles.paidDebtDate}>
                        Paid off {formatDate(new Date(debt.paidOffDate))}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </>
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
            <Text style={styles.modalTitle}>Add Debt</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Debt Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="e.g., Visa Credit Card"
              placeholderTextColor={Colors.light.textTertiary}
            />

            <Text style={styles.inputLabel}>Debt Type *</Text>
            <View style={styles.typeGrid}>
              {DEBT_TYPES.map(type => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeButton,
                    formData.type === type.value && styles.typeButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, type: type.value, isCCJ: type.value === 'ccj' })}
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

            <Text style={styles.inputLabel}>Current Balance (£) *</Text>
            <TextInput
              style={styles.input}
              value={formData.balance}
              onChangeText={(text) => setFormData({ ...formData, balance: text })}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={Colors.light.textTertiary}
            />

            <Text style={styles.inputLabel}>Interest Rate (% APR)</Text>
            <TextInput
              style={styles.input}
              value={formData.interestRate}
              onChangeText={(text) => setFormData({ ...formData, interestRate: text })}
              placeholder="0.0"
              keyboardType="decimal-pad"
              placeholderTextColor={Colors.light.textTertiary}
            />

            <Text style={styles.inputLabel}>Minimum Payment (£) *</Text>
            <TextInput
              style={styles.input}
              value={formData.minimumPayment}
              onChangeText={(text) => setFormData({ ...formData, minimumPayment: text })}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={Colors.light.textTertiary}
            />

            <Text style={styles.inputLabel}>Creditor Name</Text>
            <TextInput
              style={styles.input}
              value={formData.creditor}
              onChangeText={(text) => setFormData({ ...formData, creditor: text })}
              placeholder="e.g., Barclays"
              placeholderTextColor={Colors.light.textTertiary}
            />

            <Text style={styles.inputLabel}>Payment Due Day (1-31)</Text>
            <TextInput
              style={styles.input}
              value={formData.paymentDay}
              onChangeText={(text) => setFormData({ ...formData, paymentDay: text })}
              placeholder="e.g., 28 (28th of month)"
              keyboardType="number-pad"
              placeholderTextColor={Colors.light.textTertiary}
            />
            <Text style={styles.helperText}>Day of the month when payment is due</Text>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddDebt}>
              <Text style={styles.submitButtonText}>Add Debt</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showPaymentModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.paymentModalOverlay}>
          <View style={styles.paymentModalContent}>
            <Text style={styles.paymentModalTitle}>Make Payment</Text>
            <Text style={styles.paymentModalSubtitle}>
              {selectedDebt?.name}
            </Text>
            <Text style={styles.paymentModalBalance}>
              Current Balance: {selectedDebt && formatCurrency(selectedDebt.balance)}
            </Text>

            <Text style={styles.inputLabel}>Payment Amount (£)</Text>
            <TextInput
              style={styles.input}
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={Colors.light.textTertiary}
              autoFocus
            />

            <View style={styles.paymentModalButtons}>
              <TouchableOpacity
                style={styles.paymentModalButtonCancel}
                onPress={() => {
                  setShowPaymentModal(false);
                  setPaymentAmount('');
                }}
              >
                <Text style={styles.paymentModalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.paymentModalButtonSubmit}
                onPress={handleMakePayment}
              >
                <Text style={styles.paymentModalButtonSubmitText}>Submit Payment</Text>
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center' as const,
    paddingHorizontal: 40,
    marginBottom: 32,
  },
  addButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addButtonLargeText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFF',
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
  debtFreeCard: {
    backgroundColor: Colors.light.successLight,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center' as const,
    marginBottom: 24,
  },
  debtFreeLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.light.success,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  debtFreeDate: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.success,
    marginBottom: 4,
  },
  debtFreeSubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  debtCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  debtCardCCJ: {
    borderColor: Colors.light.ccjRed,
    borderWidth: 2,
    backgroundColor: Colors.light.ccjBg,
  },
  debtCardTarget: {
    borderColor: Colors.light.tint,
    borderWidth: 2,
  },
  ccjBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.ccjRed,
    alignSelf: 'flex-start' as const,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
    marginBottom: 12,
  },
  ccjBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.success,
    alignSelf: 'flex-start' as const,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
    marginBottom: 12,
  },
  targetBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  debtHeaderLeft: {
    flex: 1,
  },
  debtName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  debtType: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  deleteButton: {
    padding: 4,
  },
  debtStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  debtStat: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 8,
  },
  debtStatLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  debtStatValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  debtStatValueTarget: {
    color: Colors.light.success,
  },
  paymentButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
  paymentButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  paidDebtCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.light.successLight,
  },
  paidDebtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  paidDebtName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.success,
  },
  paidDebtDate: {
    fontSize: 13,
    color: Colors.light.textSecondary,
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
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  paymentModalBalance: {
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
