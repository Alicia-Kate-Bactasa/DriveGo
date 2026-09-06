import { z } from "zod";

export const driveItemSchema = z.object({
  driveId: z.string().cuid("Invalid drive ID"),
  name: z.string().min(1, "Item name is required").max(120),
  description: z.string().max(1000).optional(),
  quantity: z.coerce.number().int().min(1).default(1),
  unit: z.string().max(20).optional(),
  urgency: z.enum(["critical", "high", "medium", "low"]).optional(),
});