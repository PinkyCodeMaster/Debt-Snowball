import { StyleSheet, Text, View, ScrollView, Platform, TouchableOpacity } from "react-native";
import { useDebtSnowball } from "@/contexts/DebtSnowballContext";
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from "@/constants/colors";
import { formatCurrency, formatDate } from "@/utils/calculations";
import { CheckCircle2, Circle, Calendar, TrendingDown, AlertCircle, PoundSterling, Wallet, CreditCard } from "lucide-react-native";

const BABY_STEPS_INFO = [
  {
    id: 1,
    name: "£1,000 Emergency Fund",
    shortName: "£1K Fund",
    description: "Save £1,000 for life's unexpected events",
    icon: "💷",
  },
  {
    id: 2,
    name: "Pay Off All Debt",
    shortName: "Debt Free",
    description: "Use the debt snowball to eliminate all debt (except mortgage)",
    icon: "❄️",
  },
  {
    id: 3,
    name: "3-6 Months Expenses",
    shortName: "Full Fund",
    description: "Build a fully funded emergency fund",
    icon: "🛡️",
  },
  {
    id: 4,
    name: "Invest 15%",
    shortName: "Retirement",
    description: "Invest 15% of income into pensions and ISAs",
    icon: "📈",
  },
  {
    id: 5,
    name: "Children's Education",
    shortName: "Education",
    description: "Save for your children's future",
    icon: "🎓",
  },
  {
    id: 6,
    name: "Pay Off Mortgage",
    shortName: "Own Home",
    description: "Pay off your home early",
    icon: "🏠",
  },
  {
    id: 7,
    name: "Build Wealth & Give",
    shortName: "Wealth",
    description: "Build wealth and be outrageously generous",
    icon: "🎁",
  },
];

export default function BabyStepsScreen() {
  const {
    babySteps,
    totalDebt,
    monthlyDiscretionary,
    debtFreeDate,
    isLoading,
    incomes,
    expenses,
    debts,
  } = useDebtSnowball();
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your journey...</Text>
      </View>
    );
  }

  const currentStepInfo = BABY_STEPS_INFO[babySteps.currentStep - 1];
  const isStep1 = babySteps.currentStep === 1;
  const isStep2 = babySteps.currentStep === 2;
  const isStep3 = babySteps.currentStep === 3;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Debt-Free Journey</Text>
        <Text style={styles.headerSubtitle}>Following Dave Ramsey&apos;s Baby Steps</Text>
      </View>

      <View style={styles.currentStepCard}>
        <View style={styles.currentStepHeader}>
          <Text style={styles.currentStepBadge}>CURRENT STEP</Text>
          <Text style={styles.currentStepNumber}>{currentStepInfo.icon}</Text>
        </View>
        <Text style={styles.currentStepTitle}>
          Step {babySteps.currentStep}: {currentStepInfo.name}
        </Text>
        <Text style={styles.currentStepDescription}>
          {currentStepInfo.description}
        </Text>

        {isStep1 && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Emergency Fund Progress</Text>
              <Text style={styles.progressAmount}>
                {formatCurrency(babySteps.step1Progress)} / {formatCurrency(babySteps.step1Target)}
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${(babySteps.step1Progress / babySteps.step1Target) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressPercentage}>
              {Math.round((babySteps.step1Progress / babySteps.step1Target) * 100)}% Complete
            </Text>
          </View>
        )}

        {isStep2 && (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <TrendingDown size={20} color={Colors.light.danger} />
              <Text style={styles.statValue}>{formatCurrency(totalDebt)}</Text>
              <Text style={styles.statLabel}>Total Debt</Text>
            </View>
            {debtFreeDate && (
              <View style={styles.statCard}>
                <Calendar size={20} color={Colors.light.success} />
                <Text style={styles.statValue}>{formatDate(debtFreeDate)}</Text>
                <Text style={styles.statLabel}>Debt-Free Date</Text>
              </View>
            )}
            {monthlyDiscretionary > 0 && (
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{formatCurrency(monthlyDiscretionary)}</Text>
                <Text style={styles.statLabel}>Extra Per Month</Text>
              </View>
            )}
          </View>
        )}

        {isStep3 && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Full Emergency Fund</Text>
              <Text style={styles.progressAmount}>
                {formatCurrency(babySteps.step3Progress)} / {formatCurrency(babySteps.step3Target)}
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${Math.min((babySteps.step3Progress / babySteps.step3Target) * 100, 100)}%` },
                ]}
              />
            </View>
          </View>
        )}
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push('/income');
            }}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: Colors.light.successLight }]}>
              <PoundSterling size={20} color={Colors.light.income} />
            </View>
            <Text style={styles.actionTitle}>Income</Text>
            <Text style={styles.actionValue}>{incomes.length}</Text>
            <Text style={styles.actionLabel}>sources</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push('/budget');
            }}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: Colors.light.warningLight }]}>
              <Wallet size={20} color={Colors.light.expense} />
            </View>
            <Text style={styles.actionTitle}>Budget</Text>
            <Text style={styles.actionValue}>{expenses.length}</Text>
            <Text style={styles.actionLabel}>expenses</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push('/snowball');
            }}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: Colors.light.dangerLight }]}>
              <CreditCard size={20} color={Colors.light.debt} />
            </View>
            <Text style={styles.actionTitle}>Debts</Text>
            <Text style={styles.actionValue}>{debts.filter(d => d.status === 'active').length}</Text>
            <Text style={styles.actionLabel}>active</Text>
          </TouchableOpacity>
        </View>
      </View>

      {monthlyDiscretionary < 0 && babySteps.currentStep <= 2 && (
        <View style={styles.warningCard}>
          <AlertCircle size={20} color={Colors.light.warning} />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Budget Alert</Text>
            <Text style={styles.warningText}>
              Your expenses exceed income by {formatCurrency(Math.abs(monthlyDiscretionary))} per month.
              Review your budget to free up money for debt payments.
            </Text>
          </View>
        </View>
      )}

      <View style={styles.stepsContainer}>
        <Text style={styles.sectionTitle}>All 7 Baby Steps</Text>
        {BABY_STEPS_INFO.map((step) => {
          const isComplete = step.id < babySteps.currentStep || 
            (step.id === 1 && babySteps.step1Completed) ||
            (step.id === 2 && babySteps.step2Completed) ||
            (step.id === 3 && babySteps.step3Completed);
          const isCurrent = step.id === babySteps.currentStep;

          return (
            <View
              key={step.id}
              style={[
                styles.stepItem,
                isCurrent && styles.stepItemCurrent,
                isComplete && styles.stepItemComplete,
              ]}
            >
              <View style={styles.stepIconContainer}>
                {isComplete ? (
                  <CheckCircle2 size={24} color={Colors.light.success} />
                ) : (
                  <Circle size={24} color={isCurrent ? Colors.light.tint : Colors.light.textTertiary} />
                )}
              </View>
              <View style={styles.stepContent}>
                <Text style={[
                  styles.stepTitle,
                  isCurrent && styles.stepTitleCurrent,
                  isComplete && styles.stepTitleComplete,
                ]}>
                  {step.icon} Step {step.id}: {step.shortName}
                </Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
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
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.light.textSecondary,
  },
  currentStepCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  currentStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  currentStepBadge: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.light.success,
    letterSpacing: 1,
  },
  currentStepNumber: {
    fontSize: 32,
  },
  currentStepTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  currentStepDescription: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  progressSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
  },
  progressAmount: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.light.successLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.light.success,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.success,
    marginTop: 8,
    textAlign: 'center' as const,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center' as const,
    gap: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.text,
    textAlign: 'center' as const,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center' as const,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.warningLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.warning,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: Colors.light.text,
    lineHeight: 18,
  },
  stepsContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  stepItemCurrent: {
    borderColor: Colors.light.tint,
    borderWidth: 2,
  },
  stepItemComplete: {
    opacity: 0.7,
  },
  stepIconContainer: {
    paddingTop: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  stepTitleCurrent: {
    color: Colors.light.tint,
  },
  stepTitleComplete: {
    color: Colors.light.success,
  },
  stepDescription: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  quickActions: {
    marginBottom: 24,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center' as const,
    gap: 8,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 4,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  actionValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  actionLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
});
