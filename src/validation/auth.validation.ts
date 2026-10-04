import z from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8, "Password Must Minimum 8 Characters Long.")
    .regex(/[a-z]/, "Password must contain at least 1 Lowercase Letter")
    .regex(/[A-Z]/, "Password must contain at least 1 Uppercase Letter")
    .regex(/[0-9]/, "Password must contain at least 1 Number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least 1 Special Character",
    ),
});

export const patientRegistrationSchema = z
  .object({
    name: z
      .string("Not A String!!!!!")
      .min(3, "Name must atleast 3 characters long!!!")
      .max(50, "Name must not exceed 10 characters"),

    email: z.email("Not email!!"),

    password: z
      .string()
      .min(8, "Password Must Minimum 8 Characters Long.")
      .regex(
        /[a-z]/,
        "Password must contain atleast 1 Lowercase Letter",
      )
      .regex(
        /[A-Z]/,
        "Password must contain atleast 1 Uppercase Letter",
      )
      .regex(
        /[0-9]/,
        "Password must contain atleast 1 Number",
      )
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain atleast 1 Special Character",
      ),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),

    phone: z
      .string()
      .regex(
        /^(?:\+?880|0)1[3-9]\d{8}$/,
        "Please provide valid Bangladeshi number",
      ),

    location: z
      .string()
      .min(2, "Location must be at least 2 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password do not match",
    path: ["confirmPassword"],
  });