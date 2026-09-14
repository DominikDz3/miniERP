import { ProtectedRoute } from "../auth/components/ProtectedRoute"
import { SuppliersView } from "@/features/suppliers/views/SuppliersView"
import { SupplierDetailsView } from "./views/SuppliersDetailsView"
import { SupplierFormView } from "./views/SupplierFormView"

export const supplierRoutes = [
    {
        element: <ProtectedRoute requiredAuthority="SUPPLIER_READ"/>,
        children: [
            { path: "/suppliers", element: <SuppliersView />},
            { path: "/suppliers/:id", element: <SupplierDetailsView/>}
        ]
    },
    {
        element: <ProtectedRoute requiredAuthority="SUPPLIER_WRITE"/>,
        children: [
            { path: "/suppliers/new", element: <SupplierFormView/>}
        ]
    }
]