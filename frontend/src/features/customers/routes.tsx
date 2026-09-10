import { ProtectedRoute } from "../auth/components/ProtectedRoute";
import { CustomersView } from "./views/CustomersView";
import { CustomerDetailsView } from "./views/CustomerDetailsView";
import { CustomerFormView } from "@/features/customers/views/CustomerFormView";


export const customerRoutes = [
    {
        element: <ProtectedRoute requiredAuthority="CLIENT_READ"/>,
        children: [
            { path: "/customers", element: <CustomersView/>},
            { path: "/customers/:id", element: <CustomerDetailsView/>}
        ],
    },   
    {
        element: <ProtectedRoute requiredAuthority="CLIENT_WRITE" />,
        children: [
            { path: "/customers/new", element: <CustomerFormView /> },
        ],
    },
];