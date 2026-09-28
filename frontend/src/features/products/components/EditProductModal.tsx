import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/Modal";
import { labelCls, inputCls } from "@/shared/components/formStyles";
import { productEditSchema, type ProductEditValues } from "@/features/products/schemas/productForm";
import { useUpdateProduct, useActiveCategories } from "@/features/products/hooks/useProducts";
import { ApiError } from "@/shared/services/apiClient";
import type { ProductResponse, ProductUpdateRequest } from "@/features/products/types/catalog";

interface Props {
  product: ProductResponse;
  onClose: () => void;
}

export function EditProductModal({ product, onClose }: Props) {
  const updateProduct = useUpdateProduct();
  const { data: categories } = useActiveCategories();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductEditValues>({
    resolver: zodResolver(productEditSchema),
    defaultValues: {
      name: product.name,
      description: product.description ?? "",
      categoryId: String(product.categoryId),
      purchasePrice: product.purchasePrice,
      salePrice: product.salePrice,
      vatRate: product.vatRate,
      unit: product.unit,
      minStock: product.minStock,
    },
    mode: "onBlur",
  });

  const onSubmit = async (values: ProductEditValues) => {
    setServerError(null);

    const body: ProductUpdateRequest = {
      name: values.name,
      description: values.description || undefined,
      categoryId: Number(values.categoryId),
      purchasePrice: values.purchasePrice,
      salePrice: values.salePrice,
      vatRate: values.vatRate,
      unit: values.unit,
      minStock: values.minStock,
    };

    try {
      await updateProduct.mutateAsync({ id: product.id, body });
      onClose();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.detail : "Błąd zapisu produktu");
    }
  };

  return (
    <Modal open title={`Edycja: ${product.name}`} onClose={onClose}>
      {serverError && (
        <div className="mb-4 flex gap-2 items-start bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="text-red-500">⚠</span>
          <p className="text-red-700 text-sm">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className={labelCls}>Nazwa</label>
          <input className={inputCls} {...register("name")} />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className={labelCls}>Opis</label>
          <textarea className={inputCls} rows={2} {...register("description")} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Kategoria</label>
            <select className={inputCls} {...register("categoryId")}>
              <option value="" disabled>wybierz kategorię</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-red-600 text-xs mt-1">{errors.categoryId.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Jednostka</label>
            <input className={inputCls} {...register("unit")} />
            {errors.unit && <p className="text-red-600 text-xs mt-1">{errors.unit.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Cena zakupu</label>
            <input type="number" step="0.01" className={inputCls} {...register("purchasePrice", { valueAsNumber: true })} />
            {errors.purchasePrice && <p className="text-red-600 text-xs mt-1">{errors.purchasePrice.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Cena sprzedaży</label>
            <input type="number" step="0.01" className={inputCls} {...register("salePrice", { valueAsNumber: true })} />
            {errors.salePrice && <p className="text-red-600 text-xs mt-1">{errors.salePrice.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Stawka VAT</label>
            <select className={inputCls} {...register("vatRate")}>
              <option value="VAT_23">23%</option>
              <option value="VAT_8">8%</option>
              <option value="VAT_5">5%</option>
              <option value="VAT_0">0%</option>
            </select>
          </div>
        </div>

        <div className="w-1/3">
          <label className={labelCls}>Min. stan</label>
          <input type="number" className={inputCls} {...register("minStock", { valueAsNumber: true })} />
          {errors.minStock && <p className="text-red-600 text-xs mt-1">{errors.minStock.message}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">Anuluj</button>
          <button type="submit" disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
            {isSubmitting ? "Zapisywanie…" : "Zapisz zmiany"}
          </button>
        </div>
      </form>
    </Modal>
  );
}