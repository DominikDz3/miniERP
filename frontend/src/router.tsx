import { createBrowserRouter } from "react-router";
import { AppLayout } from "./core/layouts/AppLayout";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { CustomersView } from "./features/customers/views/CustomersView"
import { CustomerDetailsView } from "./features/customers/views/CustomerDetailsView"

import {
    DashboardPage, SuppliersPage, ProductsPage,
    WarehousePage, SalesPage, PurchasesPage, ReportsPage, AuditPage, ForbiddenPage,
} from "./pages/modules/Placeholders";
import { authRoutes } from "./features/auth/routes";
import { customerRoutes } from "./features/customers/routes";

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

                    // placeholders - for now

                    { 
                        element: <ProtectedRoute requiredAuthority="CLIENT_READ" />,
                        children: [
                            { path: "/customers", element: <CustomersView /> },
                            { path: "/customers/:id", element: <CustomerDetailsView/>}
                        ]
                    },  
                    {
                        element: <ProtectedRoute requiredAuthority="SUPPLIER_READ" />,
                        children: [{ path: "/suppliers", element: <SuppliersPage /> }],
                    },
                    {
                        element: <ProtectedRoute requiredAuthority="PRODUCT_READ" />,
                        children: [{ path: "/products", element: <ProductsPage /> }],
                    },
                    {
                        element: <ProtectedRoute requiredAuthority="WAREHOUSE_READ" />,
                        children: [{ path: "/warehouses", element: <WarehousePage /> }],
                    },
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
