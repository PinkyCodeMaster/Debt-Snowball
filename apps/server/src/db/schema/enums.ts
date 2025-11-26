import { pgEnum } from "drizzle-orm/pg-core";

export const debtTypeEnum = pgEnum("debt_type", [
  "credit_card",
  "personal_loan",
  "overdraft",
  "bnpl",
  "car_finance",
  "ccj",
  "payday_loan",
  "store_card",
  "mortgage",
]);

export const debtStatusEnum = pgEnum("debt_status", [
  "active",
  "paid_off",
]);

export const expenseCategoryEnum = pgEnum("expense_category", [
  "housing",
  "utilities",
  "food",
  "transport",
  "insurance",
  "subscription",
  "childcare",
  "medical",
  "phone",
  "entertainment",
  "other",
]);

export const expensePriorityEnum = pgEnum("expense_priority", [
  "essential",
  "non_essential",
]);

export const expenseFrequencyEnum = pgEnum("expense_frequency", [
  "weekly",
  "monthly",
  "quarterly",
  "annually",
]);

export const incomeTypeEnum = pgEnum("income_type", [
  "wages",
  "side_project",
  "universal_credit",
  "benefits",
  "self_employment",
  "rental",
  "other",
]);

export const incomeFrequencyEnum = pgEnum("income_frequency", [
  "weekly",
  "fortnightly",
  "4-weekly",
  "monthly",
]);
