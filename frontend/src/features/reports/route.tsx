import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { ReportsView } from "./views/ReportsView";

export const reportRoutes = [
  {
    element: <ProtectedRoute requiredAuthority="REPORT_READ" />,
    children: [
      { path: "/reports", element: <ReportsView /> },
    ],
  },
];