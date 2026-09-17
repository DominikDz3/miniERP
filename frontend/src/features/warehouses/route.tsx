import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { WarehousesView } from "./views/WarehouseView";
import { WarehousesDetailsView } from "./views/WarehousesDetailsView";
import { WarehouseFormView } from "./views/WarehouseFormView";
import { WarehouseReceiveView } from "./views/WarehouseReceiveView";
import { WarehouseIssueView } from "./views/WarehouseIssueView";
import { WarehouseTransferView } from "./views/WarehouseTransferView";
import { StockMovementsView } from "./views/StockMovementsView";

export const warehousesRoutes = [
  {
    element: <ProtectedRoute requiredAuthority="WAREHOUSE_READ" />,
    children: [
      { path: "/warehouses", element: <WarehousesView /> },
      { path: "/warehouses/:id", element: <WarehousesDetailsView /> },
    ],
  },
  {
    element: <ProtectedRoute requiredAuthority="WAREHOUSE_OPERATE" />,
    children: [
      { path: "/warehouses/:id/receive", element: <WarehouseReceiveView /> },
      { path: "/warehouses/:id/issue", element: <WarehouseIssueView /> },
      { path: "/warehouses/:id/transfer", element: <WarehouseTransferView /> },
    ],
  },
  {
    element: <ProtectedRoute requiredAuthority="WAREHOUSE_MANAGE" />,
    
    children: [
      { path: "/warehouses/new", element: <WarehouseFormView /> },
      { path: "/warehouses/movements", element: <StockMovementsView /> },
    ],
  },
];