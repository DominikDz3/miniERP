import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { UsersView } from "./views/UsersView";

export const userRoutes = [
  {
    element: <ProtectedRoute requiredAuthority="USER_MANAGE" />,
    children: [
      { path: "/users", element: <UsersView /> },
    ],
  },
];