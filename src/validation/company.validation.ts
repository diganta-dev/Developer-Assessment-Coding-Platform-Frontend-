import z from "zod";

export const memberInviteSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  role: z.string().min(1, "Please select a member role"),
});

export type MemberInviteFormValues = z.infer<typeof memberInviteSchema>;
