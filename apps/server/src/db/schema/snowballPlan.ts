import {
    pgTable,
    uuid,
    numeric,
    integer,
    text,
    boolean,
} from "drizzle-orm/pg-core";

import { debts } from "./debts";

export const snowballPlan = pgTable("snowball_plan", {
    id: uuid("id").defaultRandom().primaryKey(),
    debtId: uuid("debt_id")
        .notNull()
        .references(() => debts.id, { onDelete: "cascade" }),

    debtName: text("debt_name").notNull(),
    currentBalance: numeric("current_balance").notNull(),
    monthlyPayment: numeric("monthly_payment").notNull(),
    isTarget: boolean("is_target").notNull().default(false),
    position: integer("position").notNull(),
});
