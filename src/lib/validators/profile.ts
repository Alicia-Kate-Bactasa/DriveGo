import { z } from "zod";

export const profileUpdateSchema = z.object({
  displayName: z.string().min(1).max(80).optional(),
  avatarUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  bio: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
