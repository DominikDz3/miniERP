import { z } from "zod";

export const productFormSchema = z.object({
  sku: z.string().min(1, "SKU jest wymagane").max(64),
  name: z.string().min(1, "Nazwa jest wymagana").max(200),
  description: z.string().max(1000).optional(),
  categoryId: z.string().min(1, "Wybierz kategorię"),
  warehouseId: z.string().min(1, "Wybierz magazyn"),
  purchasePrice: z.number().nonnegative("Cena nie może być ujemna"),
  salePrice: z.number().nonnegative("Cena nie może być ujemna"),
  vatRate: z.enum(["VAT_23", "VAT_8", "VAT_5", "VAT_0"]),
  unit: z.string().min(1, "Jednostka jest wymagana").max(20),
  stock: z.number().int().nonnegative("Stan nie może być ujemny"),
  minStock: z.number().int().nonnegative("Minimum nie może być ujemne"),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;