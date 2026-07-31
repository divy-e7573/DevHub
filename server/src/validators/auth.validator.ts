import { z } from "zod";

export const nameSchema = z
  .string({
    required_error: "Name is required.",
    invalid_type_error: "Name must be a string.",
  })
  .trim()
  .min(2, "Name must be at least 2 characters long.")
  .max(100, "Name must not exceed 100 characters.");

export const usernameSchema = z
  .string({
    required_error: "Username is required.",
    invalid_type_error: "Username must be a string.",
  })
  .trim()
  .toLowerCase()
  .min(3, "Username must be at least 3 characters long.")
  .max(30, "Username must not exceed 30 characters.")
  .regex(
    /^[a-z0-9_]+$/,
    "Username may contain only lowercase letters, numbers, and underscores.",
  );

export const emailSchema = z
  .string({
    required_error: "Email is required.",
    invalid_type_error: "Email must be a string.",
  })
  .trim()
  .toLowerCase()
  .max(254, "Email must not exceed 254 characters.")
  .email("Email must be a valid email address.");

export const passwordSchema = z
  .string({
    required_error: "Password is required.",
    invalid_type_error: "Password must be a string.",
  })
  .min(8, "Password must be at least 8 characters long.")
  .max(128, "Password must not exceed 128 characters.");

export const registerUserSchema = z
  .object({
    name: nameSchema,
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
  })
  .strict();

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
