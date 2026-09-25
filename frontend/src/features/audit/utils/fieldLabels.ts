export const FIELD_LABELS: Record<string, string> = {
  name: "Nazwa",
  sku: "SKU",
  street: "Ulica",
  country: "Kraj",
  postalCode: "Kod pocztowy",
  city: "Miasto",
  description: "Opis",
  categoryId: "Kategoria (ID)",
  warehouseId: "Magazyn (ID)",
  purchasePrice: "Cena zakupu",
  salePrice: "Cena sprzedaży",
  vatRate: "Stawka VAT",
  unit: "Jednostka",
  stock: "Stan",
  minStock: "Min. stan",
  nip: "NIP",
  email: "E-mail",
  phone: "Telefon",
  fullName: "Imię i nazwisko",
  roleName: "Rola",
  supplierId: "Dostawca (ID)",
  customerId: "Klient (ID)",
};

export function fieldLabel(key: string): string {
  return FIELD_LABELS[key] ?? key;
}