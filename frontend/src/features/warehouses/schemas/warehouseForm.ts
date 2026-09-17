import { z } from "zod";

export const warehouseFormSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana").max(150),
  phone: z.string()
    .min(1, "Telefon jest wymagany")
    .regex(/^\+?[0-9\s\-()]{6,20}$/, "Nieprawidłowy numer telefonu"),
  street: z.string().min(1, "Ulica jest wymagana").max(200),
  city: z.string().min(1, "Miasto jest wymagane").max(100),
  postalCode: z.string()
    .min(1, "Kod pocztowy jest wymagany")
    .regex(/^[0-9\s\-]{3,10}$/, "Nieprawidłowy kod pocztowy"),
  country: z.string().max(60).optional(),
});

export type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;