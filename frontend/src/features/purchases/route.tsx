import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { PurchaseOrdersView } from "./views/PurchaseOrdersView";
import { PurchaseOrderFormView } from "./views/PurchaseOrderFormView";
import { PurchaseOrderDetailsView } from "./views/PurchaseOrdersDetailsView";

export const purchaseRoutes = [
  {
    element: <ProtectedRoute requiredAuthority="PURCHASE_READ" />,
    children: [
      { path: "/purchase-orders", element: <PurchaseOrdersView /> },
      { path: "/purchase-orders/new", element: <PurchaseOrderFormView /> },
      { path: "/purchase-orders/:id", element: <PurchaseOrderDetailsView /> },
    ],
  },
];