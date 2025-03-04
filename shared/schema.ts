import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sheets = pgTable("sheets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startIndex: integer("start_index").notNull(),
  endIndex: integer("end_index").notNull(),
  timeLimit: integer("time_limit").notNull(), // in minutes
  correctMarks: integer("correct_marks").notNull(),
  negativeMarks: integer("negative_marks").notNull(),
  questions: jsonb("questions").$type<Question[]>().notNull(),
  answerFile: text("answer_file"), // Store the uploaded file path
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
  correctAnswer: 0 | 1 | 2 | 3; // 0=A, 1=B, 2=C, 3=D
};

export type Answer = {
  questionId: number;
  selectedOption: 0 | 1 | 2 | 3;
};

export type ImageAnalysis = {
  questionId: number;
  confidence: number;
  suggestedAnswer: 0 | 1 | 2 | 3;
};

export const insertSheetSchema = createInsertSchema(sheets).extend({
  startIndex: z.number().min(1, "Start index must be positive"),
  endIndex: z.number().min(1, "End index must be positive"),
  correctMarks: z.number().min(0, "Correct marks cannot be negative"),
  negativeMarks: z.number().min(0, "Negative marks cannot be negative"),
  questions: z.array(z.object({
    id: z.number(),
    correctAnswer: z.number().min(0).max(3)
  }))
});

export const insertAttemptSchema = createInsertSchema(attempts).extend({
  answers: z.array(z.object({
    questionId: z.number(),
    selectedOption: z.number().min(0).max(3)
  }))
});

export type InsertSheet = z.infer<typeof insertSheetSchema>;
export type InsertAttempt = z.infer<typeof insertAttemptSchema>;
export type Sheet = typeof sheets.$inferSelect;
export type Attempt = typeof attempts.$inferSelect;