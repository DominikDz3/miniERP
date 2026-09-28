import { z } from "zod";

const payerSchema = z.object({
  street: z.string().min(1, "Ulica jest wymagana").max(200),
  city: z.string().min(1, "Miasto jest wymagane").max(100),
  postalCode: z.string().min(1, "Kod pocztowy jest wymagany").max(10),
  country: z.string().max(60).optional(),
});

const dataFields = {
  name: z.string().min(1, "Nazwa jest wymagana").max(200),
  nip: z.string().regex(/^\d{10}$/, "NIP musi mieć 10 cyfr").optional().or(z.literal("")),
  email: z.string().min(1, "E-mail jest wymagany").email("Nieprawidłowy e-mail").max(150),
};

const baseFields = {
  ...dataFields,
  payer: payerSchema,
};

export const customerFormSchema = z.discriminatedUnion("sameAsPayer", [
  z.object({
    ...baseFields,
    sameAsPayer: z.literal(true),
    receiverPhone: z.string().min(1, "Telefon odbiorcy jest wymagany").max(30),
  }),
  z.object({
    ...baseFields,
    sameAsPayer: z.literal(false),
    receiver: z.object({
      street: z.string().min(1, "Ulica jest wymagana").max(200),
      city: z.string().min(1, "Miasto jest wymagane").max(100),
      postalCode: z.string().min(1, "Kod pocztowy jest wymagany").max(10),
      country: z.string().max(60).optional(),
      phone: z.string().min(1, "Telefon odbiorcy jest wymagany").max(30),
    }),
  }),
]);

export const customerEditSchema = z.object(dataFields);

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
export type CustomerEditValues = z.infer<typeof customerEditSchema>;