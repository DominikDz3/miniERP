import { z } from "zod";

export const userCreateSchema = z.object({
  username: z.string().min(1, "Podaj login").max(50),
  password: z.string().min(6, "Hasło min. 6 znaków").max(100),
  fullName: z.string().min(1, "Podaj imię i nazwisko").max(120),
  roleName: z.enum(["ADMIN", "MANAGER", "USER"]),
});
export type UserCreateValues = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = z.object({
  fullName: z.string().min(1, "Podaj imię i nazwisko").max(120),
  roleName: z.enum(["ADMIN", "MANAGER", "USER"]),
});
export type UserUpdateValues = z.infer<typeof userUpdateSchema>;

export const passwordResetSchema = z.object({
  newPassword: z.string().min(6, "Hasło min. 6 znaków").max(100),
});
export type PasswordResetValues = z.infer<typeof passwordResetSchema>;