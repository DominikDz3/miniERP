import { NavLink, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/features/auth/context/AuthContext';

interface NavItem {
    path: string;
    label: string;
    authority: string;
    children?: NavItem[];
}

const NAV: NavItem[] = [
    { path: "/customers", label: "Klienci", authority: "CLIENT_READ"},
    { path: "/suppliers", label: "Dostawcy", authority: "SUPPLIER_READ"},
    { path: "/products", label: "Produkty", authority: "PRODUCT_READ"},
    {
      path: "/warehouses",
      label: "Magazyny",
      authority: "WAREHOUSE_READ",
      children: [
        { path: "/warehouses", label: "Lista", authority: "WAREHOUSE_READ" },
        { path: "/warehouses/movements", label: "Ruchy", authority: "WAREHOUSE_MANAGE" },
      ],
    },
    { path: "/sales-orders", label: "Sprzedaż", authority: "SALES_READ"},
    { path: "/purchase-orders", label: "Zakupy", authority: "PURCHASE_READ"},
    { path: "/reports", label: "Raporty", authority: "REPORT_READ"},
    { path: "/audit", label: "Audit log", authority: "AUDIT_READ"},
    { path: "/users", label: "Użytkownicy", authority: "USER_MANAGE" },
];

export function AppLayout() {
    const { username, authorities, logout } = useAuth();
    const location = useLocation();
    const visible = NAV.filter((n) => authorities.includes(n.authority));

    return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-56 bg-gray-800 text-gray-100 flex flex-col">
        <div className="p-4 text-lg font-semibold border-b border-gray-700">MiniERP</div>
        <nav className="flex-1 p-2 space-y-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`
            }
          >
            Dashboard
          </NavLink>

          {visible.map((n) => {
            const inSection = location.pathname.startsWith(n.path);
            const childItems = n.children?.filter((c) => authorities.includes(c.authority)) ?? [];

            return (
              <div key={n.path}>
                <NavLink
                  to={n.path}
                  end={!!n.children}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`
                  }
                >
                  {n.label}
                </NavLink>

                {inSection && childItems.length > 0 && (
                  <div className="ml-3 mt-1 space-y-1 border-l border-gray-700 pl-2">
                    {childItems.map((c) => (
                      <NavLink
                        key={c.path}
                        to={c.path}
                        end
                        className={({ isActive }) =>
                          `block px-3 py-1.5 rounded text-sm ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`
                        }
                      >
                        {c.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-700 text-sm">
          <div className="mb-2 text-gray-400">{username}</div>
          <button onClick={logout} className="text-red-300 hover:text-red-200 cursor-pointer">Wyloguj</button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}