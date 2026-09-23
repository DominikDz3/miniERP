import { createBrowserRouter } from "react-router";
import { AppLayout } from "./core/layouts/AppLayout";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { AuditPage, ForbiddenPage } from "./pages/modules/Placeholders";
import { authRoutes } from "./features/auth/routes";
import { customerRoutes } from "./features/customers/routes";
import { productRoutes } from "./features/products/route";
import { supplierRoutes } from "./features/suppliers/route";
import { warehousesRoutes } from "./features/warehouses/route";
import { salesRoutes } from "./features/sales/route";
import { purchaseRoutes } from "./features/purchases/route";
import { reportRoutes } from "./features/reports/route";
import { DashboardView } from "./features/dashboard/views/DashboardView";

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

                    // placeholders - for now

                    {
                        element: <ProtectedRoute requiredAuthority="AUDIT_READ" />,
                        children: [{ path: "/audit", element: <AuditPage /> }],
                    }
                ],
            },
        ],
    },
]);