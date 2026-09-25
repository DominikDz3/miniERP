import { NavLink, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/features/auth/context/AuthContext';

interface NavItem {
  path: string;
  label: string;
  authority: string;
  children?: NavItem[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    title: "Sprzedaż",
    items: [
      { path: "/customers", label: "Klienci", authority: "CLIENT_READ" },
      { path: "/sales-orders", label: "Zamówienia", authority: "SALES_READ" },
    ],
  },
  {
    title: "Zakupy",
    items: [
      { path: "/suppliers", label: "Dostawcy", authority: "SUPPLIER_READ" },
      { path: "/purchase-orders", label: "Zamówienia", authority: "PURCHASE_READ" },
    ],
  },
  {
    title: "Magazyn",
    items: [
      { path: "/products", label: "Produkty", authority: "PRODUCT_READ" },
      {
        path: "/warehouses", label: "Magazyny", authority: "WAREHOUSE_READ",
        children: [
          { path: "/warehouses", label: "Lista", authority: "WAREHOUSE_READ" },
          { path: "/warehouses/movements", label: "Ruchy", authority: "WAREHOUSE_MANAGE" },
        ],
      },
    ],
  },
  {
    title: "Analiza",
    items: [
      { path: "/reports", label: "Raporty", authority: "REPORT_READ" },
    ],
  },
  {
    title: "Administracja",
    items: [
      { path: "/users", label: "Użytkownicy", authority: "USER_MANAGE" },
      { path: "/audit", label: "Dziennik zdarzeń", authority: "AUDIT_READ" },
    ],
  },
];

function initials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

export function AppLayout() {
  const { username, authorities, logout } = useAuth();
  const location = useLocation();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-1.5 rounded-lg text-sm transition-colors ${
      isActive
        ? "bg-blue-600 text-white font-medium"
        : "text-gray-300 hover:bg-gray-700/60 hover:text-white"
    }`;

  const childLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-1.5 rounded-lg text-sm transition-colors ${
      isActive ? "bg-blue-600/80 text-white" : "text-gray-400 hover:bg-gray-700/60 hover:text-white"
    }`;

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-60 bg-gray-900 text-gray-100 flex flex-col">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-800">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-sm">
            M
          </div>
          <span className="text-lg font-semibold">MiniERP</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          <NavLink to="/" end className={linkClass}>Pulpit</NavLink>

          {NAV.map((group) => {
            const groupItems = group.items.filter((n) => authorities.includes(n.authority));
            if (groupItems.length === 0) return null;

            return (
              <div key={group.title}>
                <div className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {group.title}
                </div>
                <div className="space-y-1">
                  {groupItems.map((n) => {
                    const inSection = location.pathname.startsWith(n.path);
                    const childItems = n.children?.filter((c) => authorities.includes(c.authority)) ?? [];

                    return (
                      <div key={n.path}>
                        <NavLink to={n.path} end={!!n.children} className={linkClass}>{n.label}</NavLink>

                        {inSection && childItems.length > 0 && (
                          <div className="ml-3 mt-1 space-y-1 border-l border-gray-700 pl-3">
                            {childItems.map((c) => (
                              <NavLink key={c.path} to={c.path} end className={childLinkClass}>
                                {c.label}
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-gray-800 p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white text-xs font-semibold">
              {initials(username ?? "?")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{username}</div>
            </div>
            <button onClick={logout}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors cursor-pointer">
              Wyloguj
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}