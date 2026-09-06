import { z } from "zod";

export const organizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(1000).optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  logoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  location: z.string().max(200).optional(),
  verified: z.boolean().default(false),
});

export type OrganizationInput = z.infer<typeof organizationSchema>;
