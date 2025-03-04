import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertSheetSchema, insertAttemptSchema } from "@shared/schema";

function mockImageAnalysis(questionId: number): { confidence: number; suggestedAnswer: number } {
  return {
    confidence: Math.random() * 100,
    suggestedAnswer: Math.floor(Math.random() * 4)
  };
}

export async function registerRoutes(app: Express) {
  // Sheet routes
  app.post("/api/sheets", async (req, res) => {
    try {
      const sheet = insertSheetSchema.parse(req.body);
      const result = await storage.createSheet(sheet);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid sheet data" });
    }
  });

  app.get("/api/sheets", async (_req, res) => {
    const sheets = await storage.getAllSheets();
    res.json(sheets);
  });

  app.get("/api/sheets/:id", async (req, res) => {
    const sheet = await storage.getSheet(Number(req.params.id));
    if (!sheet) return res.status(404).json({ error: "Sheet not found" });
    res.json(sheet);
  });

  // Attempt routes
  app.post("/api/attempts", async (req, res) => {
    try {
      const attempt = insertAttemptSchema.parse({
        ...req.body,
        startTime: new Date(),
        endTime: null
      });

      const result = await storage.createAttempt(attempt);
      res.json(result);
    } catch (error) {
      console.error("Attempt creation error:", error);
      res.status(400).json({ error: "Invalid attempt data" });
    }
  });

  app.patch("/api/attempts/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const attempt = await storage.getAttempt(id);
      if (!attempt) return res.status(404).json({ error: "Attempt not found" });

      const updates = {
        ...req.body,
        endTime: new Date(),
      };

      const result = await storage.updateAttempt(id, updates);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.get("/api/attempts/:id", async (req, res) => {
    const attempt = await storage.getAttempt(Number(req.params.id));
    if (!attempt) return res.status(404).json({ error: "Attempt not found" });
    res.json(attempt);
  });

  // Image analysis route
  app.post("/api/analyze-image", async (req, res) => {
    const questionId = Number(req.body.questionId);
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    res.json(mockImageAnalysis(questionId));
  });

  const httpServer = createServer(app);
  return httpServer;
}