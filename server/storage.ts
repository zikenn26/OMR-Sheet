import { Sheet, InsertSheet, Attempt, InsertAttempt, ImageAnalysis } from "@shared/schema";

export interface IStorage {
  // Sheet operations
  createSheet(sheet: InsertSheet): Promise<Sheet>;
  getSheet(id: number): Promise<Sheet | undefined>;
  getAllSheets(): Promise<Sheet[]>;
  
  // Attempt operations
  createAttempt(attempt: InsertAttempt): Promise<Attempt>;
  getAttempt(id: number): Promise<Attempt | undefined>;
  updateAttempt(id: number, attempt: Partial<Attempt>): Promise<Attempt>;
  getAttemptsBySheet(sheetId: number): Promise<Attempt[]>;
}

export class MemStorage implements IStorage {
  private sheets: Map<number, Sheet>;
  private attempts: Map<number, Attempt>;
  private sheetId: number;
  private attemptId: number;

  constructor() {
    this.sheets = new Map();
    this.attempts = new Map();
    this.sheetId = 1;
    this.attemptId = 1;
  }

  async createSheet(sheet: InsertSheet): Promise<Sheet> {
    const id = this.sheetId++;
    const newSheet: Sheet = { ...sheet, id };
    this.sheets.set(id, newSheet);
    return newSheet;
  }

  async getSheet(id: number): Promise<Sheet | undefined> {
    return this.sheets.get(id);
  }

  async getAllSheets(): Promise<Sheet[]> {
    return Array.from(this.sheets.values());
  }

  async createAttempt(attempt: InsertAttempt): Promise<Attempt> {
    const id = this.attemptId++;
    const newAttempt: Attempt = { ...attempt, id };
    this.attempts.set(id, newAttempt);
    return newAttempt;
  }

  async getAttempt(id: number): Promise<Attempt | undefined> {
    return this.attempts.get(id);
  }

  async updateAttempt(id: number, update: Partial<Attempt>): Promise<Attempt> {
    const attempt = await this.getAttempt(id);
    if (!attempt) throw new Error("Attempt not found");
    
    const updatedAttempt = { ...attempt, ...update };
    this.attempts.set(id, updatedAttempt);
    return updatedAttempt;
  }

  async getAttemptsBySheet(sheetId: number): Promise<Attempt[]> {
    return Array.from(this.attempts.values())
      .filter(attempt => attempt.sheetId === sheetId);
  }
}

export const storage = new MemStorage();
