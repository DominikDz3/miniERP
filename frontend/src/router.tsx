import { createBrowserRouter } from "react-router";
import { AppLayout } from "./core/layouts/AppLayout";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";

import {
    DashboardPage, AuditPage, ForbiddenPage,
} from "./pages/modules/Placeholders";
import { authRoutes } from "./features/auth/routes";
import { customerRoutes } from "./features/customers/routes";
import { productRoutes } from "./features/products/route";
import { supplierRoutes } from "./features/suppliers/route";
import { warehousesRoutes } from "./features/warehouses/route";
import { salesRoutes } from "./features/sales/route";
import { purchaseRoutes } from "./features/purchases/route";
import { reportRoutes } from "./features/reports/route";

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
                    { path: "/", element: <DashboardPage /> },
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