import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { productFormSchema, type ProductFormValues } from "@/features/products/schemas/productForm";
import { useCreateProduct, useActiveCategories } from "@/features/products/hooks/useProducts";
import type { ProductRequest } from "@/features/products/types/catalog";
import { ApiError } from "@/shared/services/apiClient";
import { useActiveWarehouses } from "@/features/warehouses/hooks/useWarehouses";
import { labelCls, inputCls } from "@/shared/components/formStyles";

const cardCls = "bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4";
const sectionTitleCls = "text-sm font-medium text-gray-500";

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
    defaultValues: { categoryId: "", warehouseId: "", vatRate: "VAT_23", unit: "szt", stock: 0, minStock: 0 },
    mode: "onBlur",
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
    <div className="max-w-2xl">
      <button
        onClick={() => navigate("/products")}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer"
      >
        ← Wróć do listy
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Nowy produkt</h1>
        <p className="text-sm text-gray-400 mt-1">Wprowadź dane identyfikacyjne, magazyn oraz parametry cenowe</p>
      </div>

      {serverError && (
        <div className="mb-4 flex gap-2 items-start bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="text-red-500">⚠</span>
          <p className="text-red-700 text-sm">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className={cardCls}>
          <h2 className={sectionTitleCls}>Dane podstawowe</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>SKU</label>
              <input className={inputCls} placeholder="np. PRD-001" {...register("sku")} />
              {errors.sku && <p className="text-red-600 text-xs mt-1">{errors.sku.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Nazwa</label>
              <input className={inputCls} {...register("name")} />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
            </div>
          </div>

          <div>
            <label className={labelCls}>Opis</label>
            <textarea className={inputCls} rows={2} {...register("description")} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className={labelCls}>Magazyn</label>
              <select className={inputCls} {...register("warehouseId")}>
                <option value="" disabled>wybierz magazyn</option>
                {warehouses?.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
              {errors.warehouseId && <p className="text-red-600 text-xs mt-1">{errors.warehouseId.message}</p>}
            </div>
          </div>
        </section>

        <section className={cardCls}>
          <h2 className={sectionTitleCls}>Ceny i podatki</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </section>

        <section className={cardCls}>
          <h2 className={sectionTitleCls}>Stany magazynowe</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Jednostka</label>
              <input className={inputCls} placeholder="np. szt" {...register("unit")} />
              {errors.unit && <p className="text-red-600 text-xs mt-1">{errors.unit.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Stan początkowy</label>
              <input type="number" className={inputCls} {...register("stock", { valueAsNumber: true })} />
              {errors.stock && <p className="text-red-600 text-xs mt-1">{errors.stock.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Min. stan</label>
              <input type="number" className={inputCls} {...register("minStock", { valueAsNumber: true })} />
              {errors.minStock && <p className="text-red-600 text-xs mt-1">{errors.minStock.message}</p>}
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Zapisywanie…" : "Dodaj produkt"}
          </button>
        </div>
      </form>
    </div>
  );
}