function Placeholder({ title}: { title: string}) {
    return (
        <div>
            <h1 className="text-2xl font-semibold mb-2">{title}</h1>
            <p className="text-gray-500">Moduł w budowie.{title}.</p>
        </div>
    );
}

export const DashboardPage = () => <Placeholder title="Dashboard" />;
export const CustomersPage = () => <Placeholder title="Klienci" />;
export const SuppliersPage = () => <Placeholder title="Dostawcy" />;
export const ProductsPage = () => <Placeholder title="Produkty" />;
export const WarehousePage = () => <Placeholder title="Magazyny" />;
export const SalesPage = () => <Placeholder title="Sprzedaż" />;
export const PurchasesPage = () => <Placeholder title="Zakupy" />;
export const ReportsPage = () => <Placeholder title="Raporty" />;
export const AuditPage = () => <Placeholder title="Audit log" />;
export const ForbiddenPage = () => (
    <div><h1 className="text-2xl font-semibold text-red-600">Dostęp zabroniony</h1></div>
);