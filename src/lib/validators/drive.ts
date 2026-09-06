import { z } from "zod";
import { Category, Status } from "@prisma/client";

export const driveSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000),
  summary: z.string().max(300).optional(),
  mediaUrl: z.string().url("Invalid media URL").optional().or(z.literal("")),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  category: z.nativeEnum(Category).default(Category.MONETARY),
  location: z.string().max(200).optional(),
  locationLat: z.number().nullable().optional(),
  locationLng: z.number().nullable().optional(),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
});

export const driveUpdateSchema = driveSchema.partial();

export const driveStatusSchema = z.nativeEnum(Status);

export const driveFilterSchema = z.object({
  category: z.nativeEnum(Category).optional(),
  status: z.nativeEnum(Status).default(Status.ACTIVE),
  query: z.string().max(200).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  radiusKm: z.number().min(1).max(500).optional(),
  sortBy: z.enum(["createdAt", "endsAt", "progress"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

export type DriveInput = z.infer<typeof driveSchema>;
export type DriveUpdateInput = z.infer<typeof driveUpdateSchema>;
export type DriveFilterInput = z.infer<typeof driveFilterSchema>;
