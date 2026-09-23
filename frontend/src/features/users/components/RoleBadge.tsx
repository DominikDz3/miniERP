const ROLE_STYLE: Record<string, string> = {
  ADMIN:   "bg-purple-100 text-purple-700",
  MANAGER: "bg-blue-100 text-blue-700",
  USER:    "bg-gray-100 text-gray-700",
};

export function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${ROLE_STYLE[role] ?? "bg-gray-100 text-gray-700"}`}>
      {role}
    </span>
  );
}