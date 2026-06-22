import { z } from "zod";

export const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Post can't be empty")
    .max(500, "Post must be at most 500 characters"),
  parentId: z.string().uuid().nullable().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
