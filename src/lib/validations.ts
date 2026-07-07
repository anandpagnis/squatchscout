import { z } from "zod";

export const emailField = z.string().trim().email("Enter a valid email address");
export const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const signInSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Enter your password"),
});

export const signUpSchema = z
  .object({
    role: z.enum(["customer", "contractor"]),
    full_name: z.string().trim().min(2, "Tell us your name"),
    email: emailField,
    password: passwordField,
    phone: z.string().trim().optional().or(z.literal("")),
    business_name: z.string().trim().optional().or(z.literal("")),
  })
  .refine(
    (d) => d.role !== "contractor" || (d.business_name && d.business_name.length >= 2),
    { message: "Add your business name", path: ["business_name"] },
  );

/** Post-signup role choice (first-time OAuth users) + customer → pro upgrade. */
export const chooseRoleSchema = z
  .object({
    role: z.enum(["customer", "contractor"]),
    business_name: z.string().trim().optional().or(z.literal("")),
  })
  .refine(
    (d) => d.role !== "contractor" || (d.business_name && d.business_name.length >= 2),
    { message: "Add your business name", path: ["business_name"] },
  );

export const forgotSchema = z.object({ email: emailField });

export const resetSchema = z
  .object({
    password: passwordField,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

/** Pull the first readable error out of a ZodError. */
export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please check the form and try again";
}
