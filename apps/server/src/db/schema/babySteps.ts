import { pgTable, integer, text, boolean } from "drizzle-orm/pg-core";

export const babySteps = pgTable("baby_steps", {
    id: integer("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    shortDescription: text("short_description").notNull(),
    targetAmount: integer("target_amount"),
    isCompleted: boolean("is_completed").notNull().default(false),
});
