import { z } from "zod";

export const supplierFormSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana").max(200),
  nip: z.string().regex(/^\d{10}$/, "NIP musi mieć dokładnie 10 cyfr"),
  email: z.string().min(1, "E-mail jest wymagany").email("Nieprawidłowy e-mail").max(150),
  phone: z.string().regex(/^\+?[0-9\s-]{9,15}$/, "Nieprawidłowy numer telefonu"),
  street: z.string().min(1, "Ulica jest wymagana").max(200),
  city: z.string().min(1, "Miasto jest wymagane").max(100),
  postalCode: z.string().regex(/^\d{2}-\d{3}$/, "Kod pocztowy w formacie 00-000"),
  country: z.string().max(60).optional(),
});

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;