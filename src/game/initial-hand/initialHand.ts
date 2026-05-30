import { z } from "zod";

export type InitialHandTag = {
  id: string;
  toneToken: string;
  misreadBias: string;
  pressureBias: string;
  relationshipBias: string;
  image: string;
};

export type InitialHand = {
  source: "western_astrology_llm" | "western_astrology_fallback";
  summary: string;
  cards: string[];
  tags: InitialHandTag[];
};

export const initialHandTagSchema = z.object({
  id: z.string().min(1),
  toneToken: z.string().min(12),
  misreadBias: z.string().min(12),
  pressureBias: z.string().min(12),
  relationshipBias: z.string().min(12),
  image: z.string().min(4),
});

export const initialHandSchema = z.object({
  source: z.enum(["western_astrology_llm", "western_astrology_fallback"]),
  summary: z.string().min(24),
  cards: z.array(z.string().min(1)).min(3).max(8),
  tags: z.array(initialHandTagSchema).min(5).max(7),
});
