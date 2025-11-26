import {
    pgTable,
    uuid,
    text,
    integer,
    boolean,
    timestamp,
    numeric,
    date,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

import { user, organization } from "./user";
import { incomeTypeEnum, incomeFrequencyEnum } from "./enums";

export const income = pgTable("income", {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),

    organizationId: text("organization_id")
        .references(() => organization.id, { onDelete: "set null" }),

    type: incomeTypeEnum("type").notNull(),
    name: text("name").notNull(),
    amount: numeric("amount").notNull(),

    frequency: incomeFrequencyEnum("frequency").notNull(),
    isNet: boolean("is_net").notNull().default(true),
    startDate: date("start_date").notNull(),
    paymentDay: integer("payment_day"),

    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const incomeRelations = relations(income, ({ one }) => ({
    user: one(user, {
        fields: [income.userId],
        references: [user.id],
    }),
    organization: one(organization, {
        fields: [income.organizationId],
        references: [organization.id],
    }),
}));
