import { createBrowserRouter } from "react-router";
import { AppLayout } from "./layout/AppLayout";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";

import {
    DashboardPage, CustomersPage, SuppliersPage, ProductsPage,
    WarehousePage, SalesPage, PurchasesPage, ReportsPage, AuditPage, ForbiddenPage,
} from "./pages/modules/Placeholders";

export const router = createBrowserRouter([
    { path: "/login", element: <LoginPage /> },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { path: "/", element: <DashboardPage /> },
                    { path: "/403", element: <ForbiddenPage /> },
                    { 
                        element: <ProtectedRoute requiredAuthority="CLIENT_READ" />,
                        children: [{ path: "/customers", element: <CustomersPage /> }],
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
