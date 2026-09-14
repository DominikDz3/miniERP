import { z } from "zod";

export const productFormSchema = z.object({
  sku: z.string().min(1, "SKU jest wymagane").max(64),
  name: z.string().min(1, "Nazwa jest wymagana").max(200),
  description: z.string().max(1000).optional(),
  categoryId: z.string().min(1, "Wybierz kategorię"),
  purchasePrice: z.number().nonnegative("Cena nie może być ujemna"),
  salePrice: z.number().nonnegative("Cena nie może być ujemna"),
  vatRate: z.number().nonnegative(),
  unit: z.string().min(1, "Jednostka jest wymagana").max(20),
  stock: z.number().int().nonnegative("Stan nie może być ujemny"),
  minStock: z.number().int().nonnegative("Minimum nie może być ujemne"),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;