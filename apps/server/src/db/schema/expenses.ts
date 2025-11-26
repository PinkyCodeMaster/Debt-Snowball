import { pgTable, uuid, text, numeric, integer, boolean, timestamp, } from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

import { user, organization } from "./user";
import { expenseCategoryEnum, expensePriorityEnum, expenseFrequencyEnum, } from "./enums";

export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  organizationId: text("organization_id")
    .references(() => organization.id, { onDelete: "set null" }),

  name: text("name").notNull(),
  amount: numeric("amount").notNull(),

  category: expenseCategoryEnum("category").notNull(),
  priority: expensePriorityEnum("priority").notNull(),
  frequency: expenseFrequencyEnum("frequency").notNull(),

  dueDate: integer("due_date"),
  isUCPaid: boolean("is_uc_paid").notNull().default(false),

  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(user, { fields: [expenses.userId], references: [user.id] }),
  organization: one(organization, {
    fields: [expenses.organizationId],
    references: [organization.id],
  }),
}));
