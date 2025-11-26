import { pgTable, text, integer, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { user } from "./user";

export const babyStepsProgress = pgTable("baby_steps_progress", {
    userId: text("user_id")
        .primaryKey()
        .references(() => user.id, { onDelete: "cascade" }),

    currentStep: integer("current_step").notNull(),

    step1Progress: numeric("step1_progress").notNull(),
    step1Target: numeric("step1_target").notNull(),
    step1Completed: boolean("step1_completed").notNull().default(false),

    step2Completed: boolean("step2_completed").notNull().default(false),

    step3Progress: numeric("step3_progress").notNull(),
    step3Target: numeric("step3_target").notNull(),
    step3Completed: boolean("step3_completed").notNull().default(false),

    emergencyFundBalance: numeric("emergency_fund_balance").notNull(),

    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
