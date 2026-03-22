import { z } from "zod";

export const RECORD_KINDS = [
  "milestone",
  "delivery",
  "observation",
  "incident",
  "commitment",
  "request"
];

export const recordKindSchema = z.enum(RECORD_KINDS);

export const intakeSchema = z.object({
  project: z.string().min(2).max(120).optional(),
  team: z.string().min(2).max(120).optional(),
  authorName: z.string().min(2).max(120),
  title: z.string().min(4).max(140),
  statement: z.string().min(20).max(4000),
  categoryHint: recordKindSchema.optional(),
  audience: z.enum(["public", "internal"]).default("public"),
  parties: z.array(z.string().min(1).max(120)).default([]),
  tags: z.array(z.string().min(1).max(60)).default([]),
  evidenceLinks: z.array(z.string().url()).default([]),
  sourceRefs: z.array(z.string().min(1).max(120)).default([]),
  happenedAt: z.string().optional(),
  uri: z.string().url().optional()
});

export const modelSuggestionSchema = z.object({
  kind: recordKindSchema,
  summary: z.string().min(12).max(120),
  derivedTags: z.array(z.string().min(1).max(60)).max(8).default([]),
  disclosure: z.enum(["hash_full_source_keep_public_summary", "public_note_ok"]).default(
    "hash_full_source_keep_public_summary"
  ),
  reason: z.string().min(12).max(400)
});

export const draftSchema = z.object({
  project: z.string().optional(),
  title: z.string(),
  decision: z.object({
    kind: recordKindSchema,
    kindIndex: z.number().int().nonnegative(),
    disclosure: z.enum(["hash_full_source_keep_public_summary", "public_note_ok"]),
    urgency: z.enum(["low", "normal", "high"]),
    reason: z.string()
  }),
  summary: z.string().min(12).max(120),
  canonicalSource: z.record(z.string(), z.any()),
  hashes: z.object({
    contentHash: z.string(),
    contextHash: z.string()
  }),
  derivedTags: z.array(z.string()),
  inferencePath: z.enum(["model", "heuristics", "heuristics_after_model_error"]),
  contractCall: z.object({
    function: z.literal("notarize"),
    args: z.array(z.any())
  })
});
