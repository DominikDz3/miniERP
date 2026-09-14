import { z } from "zod";

export const categoryFormSchema = z.object({
    name: z.string().min(1, "Nazwa jest wymagana").max(100)
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;