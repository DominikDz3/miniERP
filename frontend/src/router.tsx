import { createBrowserRouter } from "react-router";
import { AppLayout } from "./core/layouts/AppLayout";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";

import {
    DashboardPage, SalesPage, PurchasesPage, ReportsPage, AuditPage, ForbiddenPage,
} from "./pages/modules/Placeholders";
import { authRoutes } from "./features/auth/routes";
import { customerRoutes } from "./features/customers/routes";
import { productRoutes } from "./features/products/route";
import { supplierRoutes } from "./features/suppliers/route";
import { warehousesRoutes } from "./features/warehouses/route";

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

                    // placeholders - for now

                    {
                        element: <ProtectedRoute requiredAuthority="SALES_READ" />,
                        children: [{ path: "/sales", element: <SalesPage /> }],
                    },
                    {
                        element: <ProtectedRoute requiredAuthority="PURCHASE_READ" />,
                        children: [{ path: "/purchases", element: <PurchasesPage /> }],
                    },
                    {   
                        element: <ProtectedRoute requiredAuthority="REPORT_READ" />,
                        children: [{ path: "/reports", element: <ReportsPage /> }],
                    },
                    {
                        element: <ProtectedRoute requiredAuthority="AUDIT_READ" />,
                        children: [{ path: "/audit", element: <AuditPage /> }],
                    }
                ],
            },
        ],
    },
]);