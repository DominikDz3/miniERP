import { createBrowserRouter } from "react-router";
import { AppLayout } from "./core/layouts/AppLayout";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { ForbiddenPage } from "./shared/components/ForbiddenPage";
import { authRoutes } from "./features/auth/routes";
import { customerRoutes } from "./features/customers/routes";
import { productRoutes } from "./features/products/route";
import { supplierRoutes } from "./features/suppliers/route";
import { warehousesRoutes } from "./features/warehouses/route";
import { salesRoutes } from "./features/sales/route";
import { purchaseRoutes } from "./features/purchases/route";
import { reportRoutes } from "./features/reports/route";
import { DashboardView } from "./features/dashboard/views/DashboardView";
import { userRoutes } from "./features/users/route";
import { auditRoutes } from "./features/audit/route";

export const router = createBrowserRouter([
    // public
    ...authRoutes,

    // authenticated
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { path: "/", element: <DashboardView /> },
                    { path: "/403", element: <ForbiddenPage /> },

                    // feature routes
                    ...customerRoutes,
                    ...productRoutes,
                    ...supplierRoutes,
                    ...warehousesRoutes,
                    ...salesRoutes,
                    ...purchaseRoutes,
                    ...reportRoutes,
                    ...userRoutes,
                    ...auditRoutes,
                ],
            },
        ],
    },
]);