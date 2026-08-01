import { z } from "zod";

const monthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM format.");

const optionalText = (maxLength: number) =>
  z.string().trim().max(maxLength).optional();

const optionalUrl = z.string().trim().url("Must be a valid URL.").max(2048).optional();

const experienceSchema = z
  .object({
    company: z.string().trim().min(1).max(120),
    title: z.string().trim().min(1).max(120),
    location: optionalText(120),
    startDate: monthSchema,
    endDate: monthSchema.optional(),
    description: optionalText(2000),
  })
  .strict();

const educationSchema = z
  .object({
    institution: z.string().trim().min(1).max(160),
    degree: z.string().trim().min(1).max(120),
    fieldOfStudy: optionalText(120),
    startDate: monthSchema,
    endDate: monthSchema.optional(),
    description: optionalText(2000),
  })
  .strict();

const portfolioSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    url: z.string().trim().url("Project URL must be valid.").max(2048),
    description: optionalText(1000),
  })
  .strict();

export const updateProfileSchema = z
  .object({
    bio: optionalText(2000),
    location: optionalText(120),
    skills: z.array(z.string().trim().min(1).max(60)).max(30).optional(),
    experience: z.array(experienceSchema).max(20).optional(),
    education: z.array(educationSchema).max(10).optional(),
    portfolio: z.array(portfolioSchema).max(20).optional(),
    socialLinks: z
      .object({
        github: optionalUrl,
        twitter: optionalUrl,
        linkedin: optionalUrl,
      })
      .strict()
      .optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one profile field must be provided.",
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
