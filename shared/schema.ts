import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sheets = pgTable("sheets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  timeLimit: integer("time_limit").notNull(), // in minutes
  questions: jsonb("questions").$type<Question[]>().notNull(),
});

export const attempts = pgTable("attempts", {
  id: serial("id").primaryKey(),
  sheetId: integer("sheet_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  answers: jsonb("answers").$type<Answer[]>().notNull(),
  score: integer("score"),
  imageAnalysis: jsonb("image_analysis").$type<ImageAnalysis[]>(),
});

export type Question = {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
};

export type Answer = {
  questionId: number;
  selectedOption: number;
};

export type ImageAnalysis = {
  questionId: number;
  confidence: number;
  suggestedAnswer: number;
};

export const insertSheetSchema = createInsertSchema(sheets).extend({
  questions: z.array(z.object({
    id: z.number(),
    text: z.string().min(1, "Question text is required"),
    options: z.array(z.string()).min(2, "At least 2 options required"),
    correctAnswer: z.number().min(0)
  }))
});

export const insertAttemptSchema = createInsertSchema(attempts).extend({
  answers: z.array(z.object({
    questionId: z.number(),
    selectedOption: z.number()
  }))
});

export type InsertSheet = z.infer<typeof insertSheetSchema>;
export type InsertAttempt = z.infer<typeof insertAttemptSchema>;
export type Sheet = typeof sheets.$inferSelect;
export type Attempt = typeof attempts.$inferSelect;
