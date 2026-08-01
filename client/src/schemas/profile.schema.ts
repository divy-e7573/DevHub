import { z } from "zod";

const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM.");
const optionalText = (maxLength: number) => z.string().trim().max(maxLength);

export const profileFormSchema = z.object({
  bio: optionalText(2000),
  location: optionalText(120),
  skills: z.string().max(1800),
  github: z.union([z.literal(""), z.string().url("Enter a valid GitHub URL.")]),
  twitter: z.union([z.literal(""), z.string().url("Enter a valid Twitter URL.")]),
  linkedin: z.union([z.literal(""), z.string().url("Enter a valid LinkedIn URL.")]),
  experience: z.array(
    z.object({
      company: z.string().trim().min(1, "Company is required.").max(120),
      title: z.string().trim().min(1, "Title is required.").max(120),
      location: optionalText(120),
      startDate: monthSchema,
      endDate: z.union([z.literal(""), monthSchema]),
      description: optionalText(2000),
    }),
  ).max(20),
  education: z.array(
    z.object({
      institution: z.string().trim().min(1, "Institution is required.").max(160),
      degree: z.string().trim().min(1, "Degree is required.").max(120),
      fieldOfStudy: optionalText(120),
      startDate: monthSchema,
      endDate: z.union([z.literal(""), monthSchema]),
      description: optionalText(2000),
    }),
  ).max(10),
  portfolio: z.array(
    z.object({
      title: z.string().trim().min(1, "Project title is required.").max(120),
      url: z.string().trim().url("Enter a valid project URL.").max(2048),
      description: optionalText(1000),
    }),
  ).max(20),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
