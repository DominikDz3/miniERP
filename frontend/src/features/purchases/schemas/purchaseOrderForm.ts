import { z } from "zod";

export const purchaseOrderFormSchema = z.object({
  supplierId: z.string().min(1, "Wybierz dostawcę"),
  warehouseId: z.string().min(1, "Wybierz magazyn"),
  items: z
    .array(z.object({
      productId: z.string().min(1, "Wybierz produkt"),
      quantity: z.number({ message: "Podaj ilość" }).int().positive("Ilość > 0"),
    }))
    .min(1, "Dodaj co najmniej jedną pozycję"),
});

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderFormSchema>;