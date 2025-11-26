import {
    pgTable,
    uuid,
    numeric,
    text,
    date,
    timestamp,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

import { debts } from "./debts";

export const debtPayments = pgTable("debt_payments", {
    id: uuid("id").defaultRandom().primaryKey(),
    debtId: uuid("debt_id")
        .notNull()
        .references(() => debts.id, { onDelete: "cascade" }),

    amount: numeric("amount").notNull(),
    paymentDate: date("payment_date").notNull(),
    balanceAfter: numeric("balance_after").notNull(),
    notes: text("notes"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const debtPaymentsRelations = relations(debtPayments, ({ one }) => ({
    debt: one(debts, {
        fields: [debtPayments.debtId],
        references: [debts.id],
    }),
}));
