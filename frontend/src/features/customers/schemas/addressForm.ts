import { z } from "zod";

export function addressFormSchema(requirePhone: boolean) {
  return z.object({
    street: z.string().min(1, "Ulica jest wymagana").max(200),
    city: z.string().min(1, "Miasto jest wymagane").max(100),
    postalCode: z.string().min(1, "Kod pocztowy jest wymagany").max(10),
    country: z.string().max(60).optional(),
    phone: requirePhone
      ? z.string().min(1, "Telefon jest wymagany").max(30)
      : z.string().max(30).optional(),
  });
}

export type AddressFormValues = z.infer<ReturnType<typeof addressFormSchema>>;