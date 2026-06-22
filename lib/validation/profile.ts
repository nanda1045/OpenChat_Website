import { z } from "zod";

/**
 * Profile edit validation. Handles are the public identity, so we keep them
 * strict: lowercase letters/digits/underscores, 3–20 chars.
 */
export const profileUpdateSchema = z.object({
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Handle must be at least 3 characters")
    .max(20, "Handle must be at most 20 characters")
    .regex(
      /^[a-z0-9_]+$/,
      "Handle can only contain lowercase letters, numbers, and underscores",
    ),
  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required")
    .max(50, "Display name must be at most 50 characters"),
  bio: z
    .string()
    .trim()
    .max(280, "Bio must be at most 280 characters")
    .optional()
    .or(z.literal("")),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
