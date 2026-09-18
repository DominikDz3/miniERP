import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { SalesOrdersView } from "./views/SalesOrdersView";
import { SalesOrderDetailsView } from "./views/SalesOrderDetailsView";
import { SalesOrderFormView } from "./views/SalesOrderFormView";

export const salesRoutes = [
  {
    element: <ProtectedRoute requiredAuthority="SALES_READ" />,
    children: [
      { path: "/sales-orders", element: <SalesOrdersView /> },
      { path: "/sales-orders/:id", element: <SalesOrderDetailsView /> },
    ],
  },

  {
    element: <ProtectedRoute requiredAuthority="SALES_WRITE" />,
    children: [
      { path: "/sales-orders/new", element: <SalesOrderFormView/>}
    ]
  }
];