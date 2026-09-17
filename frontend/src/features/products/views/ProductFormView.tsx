import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { productFormSchema, type ProductFormValues } from "@/features/products/schemas/productForm";
import { useCreateProduct, useActiveCategories } from "@/features/products/hooks/useProducts";
import type { ProductRequest } from "@/features/products/types/catalog";
import { ApiError } from "@/shared/services/apiClient";
import { useActiveWarehouses } from "@/features/warehouses/hooks/useWarehouses";

const inputCls = "w-full border rounded px-3 py-2";

export function ProductFormView() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const { data: categories } = useActiveCategories();
  const { data: warehouses } = useActiveWarehouses();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { categoryId: "",warehouseId: "", vatRate: 23, unit: "szt", stock: 0, minStock: 0 },
  });

  const onSubmit = async (values: ProductFormValues) => {
    setServerError(null);

    const body: ProductRequest = {
      sku: values.sku,
      name: values.name,
      description: values.description || undefined,
      categoryId: Number(values.categoryId),
      warehouseId: Number(values.warehouseId),
      purchasePrice: values.purchasePrice,
      salePrice: values.salePrice,
      vatRate: values.vatRate,
      unit: values.unit,
      stock: values.stock,
      minStock: values.minStock,
    };

    try {
      const created = await createProduct.mutateAsync(body);
      navigate(`/products/${created.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.detail : "Błąd zapisu produktu");
    }
  };

  return (
    <div className="max-w-xl">
        <button
            onClick={() => navigate("/products")}
            className="text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer">
            ← Wróć do listy
        </button>
      <h1 className="text-2xl font-semibold mb-4">Nowy produkt</h1>

      {serverError && <p className="text-red-600 text-sm mb-3">{serverError}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-500 mb-1">SKU</label>
          <input className={inputCls} {...register("sku")} />
          {errors.sku && <p className="text-red-600 text-xs mt-1">{errors.sku.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">Nazwa</label>
          <input className={inputCls} {...register("name")} />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">Opis</label>
          <textarea className={inputCls} rows={2} {...register("description")} />
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">Kategoria</label>
          <select className={inputCls} {...register("categoryId")}>
            <option value="" disabled>wybierz</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.categoryId && <p className="text-red-600 text-xs mt-1">{errors.categoryId.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">Magazyn</label>
          <select className={inputCls} {...register("warehouseId")}>
            <option value="" disabled>wybierz</option>
              {warehouses?.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
          </select>
          {errors.warehouseId && <p className="text-red-600 text-xs mt-1">{errors.warehouseId.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Cena zakupu</label>
            <input type="number" step="0.01" className={inputCls} {...register("purchasePrice", { valueAsNumber: true })} />
            {errors.purchasePrice && <p className="text-red-600 text-xs mt-1">{errors.purchasePrice.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Cena sprzedaży</label>
            <input type="number" step="0.01" className={inputCls} {...register("salePrice", { valueAsNumber: true })} />
            {errors.salePrice && <p className="text-red-600 text-xs mt-1">{errors.salePrice.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">VAT %</label>
            <input type="number" step="0.01" className={inputCls} {...register("vatRate", { valueAsNumber: true })} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Jednostka</label>
            <input className={inputCls} {...register("unit")} />
            {errors.unit && <p className="text-red-600 text-xs mt-1">{errors.unit.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Stan</label>
            <input type="number" className={inputCls} {...register("stock", { valueAsNumber: true })} />
            {errors.stock && <p className="text-red-600 text-xs mt-1">{errors.stock.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Min. stan</label>
            <input type="number" className={inputCls} {...register("minStock", { valueAsNumber: true })} />
            {errors.minStock && <p className="text-red-600 text-xs mt-1">{errors.minStock.message}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate("/products")}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-50 cursor-pointer">
            Anuluj
          </button>
          <button type="submit" disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
            {isSubmitting ? "Zapisywanie…" : "Zapisz"}
          </button>
        </div>
      </form>
    </div>
  );
}