import z from "zod"

export const downloadVideoInputSchema = z.object({
  url: z.string().url(),
  quality: z.enum(["best", "high", "medium", "low"]).default("best"),
})

export const downloadPlaylistInputSchema = z.object({
  url: z.string().url(),
  quality: z.enum(["best", "high", "medium", "low"]).default("best"),
  limit: z.number().int().positive().optional(),
})

export const downloadBulkInputSchema = z.object({
  urls: z.array(z.string().url()),
  quality: z.enum(["best", "high", "medium", "low"]).default("best"),
})

