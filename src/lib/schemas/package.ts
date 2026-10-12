import { z } from "zod";

/** Lines textarea → string[] (trimmed, blanks removed). */
const linesToArray = z.preprocess(
  (v) =>
    typeof v === "string"
      ? v
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
      : Array.isArray(v)
        ? v
        : [],
  z.array(z.string()),
);

const optionalInt = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().int().min(0).max(365).optional(),
);

const optionalPrice = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().min(0).optional(),
);

export const packageInputSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers and dashes only"),
  scope: z.enum(["domestic", "international"]),
  tour_type: z.enum(["group", "customized"]),
  category_name: z.string().optional(),
  theme_name: z.string().optional(),
  destination_name: z.string().optional(),
  country: z.string().optional(),
  duration_days: optionalInt,
  duration_nights: optionalInt,
  overview: z.string().optional(),
  highlights: linesToArray,
  inclusions: linesToArray,
  exclusions: linesToArray,
  price_amount: optionalPrice,
  taxes_info: z.string().optional(),
  hero_image_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  source_pdf: z
    .string()
    .optional()
    .or(z.literal("")),
  is_featured: z.coerce.boolean(),
  is_active: z.coerce.boolean(),
  status: z.enum(["draft", "published"]),
});

export type PackageInput = z.infer<typeof packageInputSchema>;
