import {
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  boolean,
  date,
  timestamp,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

import { organization, user } from "./user";
import { debtStatusEnum, debtTypeEnum } from "./enums";
import { debtPayments } from "./debtPayments";


export const debts = pgTable("debts", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  organizationId: text("organization_id")
    .references(() => organization.id, { onDelete: "set null" }),

  name: text("name").notNull(),
  type: debtTypeEnum("type").notNull(),

  balance: numeric("balance").notNull(),
  interestRate: numeric("interest_rate").notNull(),
  minimumPayment: numeric("minimum_payment").notNull(),

  paymentDay: integer("payment_day"),
  isCCJ: boolean("is_ccj").notNull().default(false),
  ccjDeadline: date("ccj_deadline"),

  creditor: text("creditor").notNull(),
  status: debtStatusEnum("status").notNull().default("active"),
  paidOffDate: date("paid_off_date"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const debtsRelations = relations(debts, ({ many, one }) => ({
  payments: many(debtPayments),
  user: one(user, { fields: [debts.userId], references: [user.id] }),
  organization: one(organization, {
    fields: [debts.organizationId],
    references: [organization.id],
  }),
}));
