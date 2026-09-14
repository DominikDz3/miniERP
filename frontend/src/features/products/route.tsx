import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { ProductsView } from "./views/ProductsView";
import { ProductDetailsView } from "./views/ProductDetailsView";
import { ProductFormView } from "./views/ProductFormView";
import { CategoryFormView } from "./views/CategoryFormView"

export const productRoutes = [
  {
    element: <ProtectedRoute requiredAuthority="PRODUCT_READ" />,
    children: [
      { path: "/products", element: <ProductsView /> },
      { path: "/products/:id", element: <ProductDetailsView /> },
    ],
  },
  {
    element: <ProtectedRoute requiredAuthority="PRODUCT_WRITE" />,
    children: [
      { path: "/products/new", element: <ProductFormView /> },
      { path: "/categories/new", element: <CategoryFormView/> },
    ],
  },
];