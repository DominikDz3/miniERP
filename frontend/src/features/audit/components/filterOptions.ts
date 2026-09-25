import type { AuditAction, AuditEntity } from "../types/audit";

export const ACTIONS: { value: AuditAction; label: string }[] = [
  { value: "LOGIN_SUCCESS", label: "Logowanie" },
  { value: "LOGIN_FAILED", label: "Błąd logowania" },
  { value: "CREATE", label: "Utworzenie" },
  { value: "UPDATE", label: "Edycja" },
  { value: "ACTIVATE", label: "Aktywacja" },
  { value: "DEACTIVATE", label: "Dezaktywacja" },
  { value: "STATUS_CHANGE", label: "Zmiana statusu" },
  { value: "STOCK_MOVEMENT", label: "Ruch magazynowy" },
  { value: "PASSWORD_RESET", label: "Reset hasła" },
];

export const ENTITIES: { value: AuditEntity; label: string }[] = [
  { value: "CUSTOMER", label: "Klient" },
  { value: "SUPPLIER", label: "Dostawca" },
  { value: "PRODUCT", label: "Produkt" },
  { value: "WAREHOUSE", label: "Magazyn" },
  { value: "USER", label: "Użytkownik" },
  { value: "SALES_ORDER", label: "Zamówienie sprzedaży" },
  { value: "PURCHASE_ORDER", label: "Zamówienie zakupu" },
];