import { NavLink, Outlet } from 'react-router';
import { useAuth } from '@/features/auth/context/AuthContext';

interface NavItem { 
    path: string; 
    label: string;
    authority: string;
}

const NAV: NavItem[] = [
    { path: "/customers", label: "Klienci", authority: "CLIENT_READ"},
    { path: "/suppliers", label: "Dostawcy", authority: "SUPPLIER_READ"},
    { path: "/products", label: "Produkty", authority: "PRODUCT_READ"},
    { path: "/warehouses", label: "Magazyny", authority: "WAREHOUSE_READ"},
    { path: "/sales", label: "Sprzedaż", authority: "SALES_READ"},
    { path: "/purchases", label: "Zakupy", authority: "PURCHASE_READ"},
    { path: "/reports", label: "Raporty", authority: "REPORT_READ"},
    { path: "/audit", label: "Audit log", authority: "AUDIT_READ"}
];

export function AppLayout() {
    const { username, authorities, logout} = useAuth();
    const visible = NAV.filter((n) => authorities.includes(n.authority));

    return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-56 bg-gray-800 text-gray-100 flex flex-col">
        <div className="p-4 text-lg font-semibold border-b border-gray-700">MiniERP</div>
         <nav className="flex-1 p-2 space-y-1">
          {visible.map((n) => (
            <NavLink
              key={n.path}
              to={n.path}
              className={({ isActive }) =>
                `block px-3 py-2 rounded ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700 text-sm">
          <div className="mb-2 text-gray-400">{username}</div>
          <button onClick={logout} className="text-red-300 hover:text-red-200">Wyloguj</button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}


