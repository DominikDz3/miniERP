import { z } from "zod";

export const salesOrderFormSchema = z.object({
  customerId: z.string().min(1, "Wybierz klienta"),
  receiverAddressId: z.string().min(1, "Wybierz adres dostawy"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Wybierz produkt"),
        quantity: z.number({ message: "Podaj ilość" }).int().positive("Ilość > 0"),
      }),
    )
    .min(1, "Dodaj co najmniej jedną pozycję"),
});

export type SalesOrderFormValues = z.infer<typeof salesOrderFormSchema>;