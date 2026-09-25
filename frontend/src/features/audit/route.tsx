import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { AuditView } from "./views/AuditView";

export const auditRoutes = [
  {
    element: <ProtectedRoute requiredAuthority="AUDIT_READ" />,
    children: [
      { path: "/audit", element: <AuditView /> },
    ],
  },
];