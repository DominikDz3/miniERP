# Dokumentacja MiniERP

# 1. Wstęp

MiniERP - uproszczony system ERP. Projekt wykonywany w ramach miesięcznych praktyk w firmie TOP S.A

### 1.1. Opis projektu

Celem projektu było utworzenie webowego systemu ERP dla małej lub średniej firmy handlowej. Łączy on moduły klientów, dostawców, produktów, magazynu, sprzedaży, zakupów oraz raportowania w jeden spójny system.

### 1.2. Zastosowany stos technologiczny
| Warstwa | Technologie |
| :--- | :--- |
| Backend | Java 21, Spring boot 4.1, Gradle, Spring Security 7 (JWT), Spring Data JPA / Hibernate, Lombok, Bean Validation  |
| Baza danych | PostgreSQL 17, migracje Flyway |
| Frontend | React 19, TypeScript, Vite, React Router v7, TanStack Query v5, TanStack Table v8, React Hook Form + Zod, Tailwind CSS, Recharts |
| Dokumentacja API | Swagger / OpenApi|
| Konteneryzacja | Docker, Docker compose |

# 2. Moduły funkcjonalne

Poniższa sekcja zawiera dokładny opis funkcjonalności, które zostały wykonane w ramach danego modułu.

## 2.1. Uwierzetylnianie

Logowanie wydaje krótki access token JWT (15 min), zwracany w odpowiedzi, oraz refresh token (7 dni), zapisywany w cookie httpOnly. Gdy access token wygaśnie frontend wywołuje odświeżanie i ponawia żądanie.

| Metoda | Ścieżka | Opis | Uprawnienie
| :--- | :--- | :--- | :--- |
| POST | `/auth/login` | logowanie: login + hasło -> access token, refresh w cookie | publiczny |
| POST | `auth/refresh` | nowy access token na podstawie cookie | publiczny |
| POST | `auth/logout` | unieważnienie cookie refresh | publiczny |   

## 2.2. Moduł DASHBOARD

Pulpit startowy pokazuje w jednym widoku stan firmy. Dane pochodz a z jednego zbiorczego endpointu, by pulpit ładował się jednym zapytaniem.

| Metoda | Ścieżka | Opis | Uprawnienie
| :--- | :--- | :--- | :--- |
| GET | `/dashboard/summary` | liczniki i wartości na pulpit | zalogowany |

Moduł zawiera:

- Wyświetlanie skróconych ogólnych informacji o danych w systemie (liczba klientów, liczba produktów, liczba aktywnych zamówień, wartość sprzedaży, wartość zakupów, wartość magazynu, lista produktów z niskim stanem)
- Powiadomienia o niskim stanie wyświetlane na pulpicie
- Podstawowy wykres sprzedaży

## 2.3. Moduł KLIENT

Klient ma dane podstawowe (nazwa, NIP, e-mail) oraz dwa rodzaje adresów: płatnika (na fakturę) i odbiorcy (dokąd dostarczyć towar, telefon). Każdy rodzaj może mieć wiele adresów z których jeden jest domyślny.

| Metoda | Ścieżka | Opis | Uprawnienie |
| :--- | :--- | :--- | :--- |
| `GET` | `/customers?search=&active=` | lista klientów | `CLIENT_READ` |
| `GET` | `/customers/{id}` | szczegóły klienta | `CLIENT_READ` |
| `POST` | `/customers` | nowy klient z adresami | `CLIENT_WRITE` |
| `PUT` | `/customers/{id}` | edycja nazwy, NIP, e-maila | `CLIENT_WRITE` |
| `DELETE` | `/customers/{id}` | dezaktywacja | `CLIENT_WRITE` |
| `PATCH` | `/customers/{id}/activate` | aktywacja | `CLIENT_WRITE` |
| `GET` | `/customers/{id}/payer-addresses` | aktywne adresy płatnika | `CLIENT_READ` |
| `POST` | `/customers/{id}/payer-addresses` | nowy adres płatnika | `CLIENT_WRITE` |
| `PUT` | `/customers/{id}/payer-addresses/{addressId}` | edycja (nowa wersja adresu) | `CLIENT_WRITE` |
| `DELETE` | `/customers/{id}/payer-addresses/{addressId}` | usunięcie (soft delete) | `CLIENT_WRITE` |
| `PATCH` | `/customers/{id}/default-payer/{addressId}` | ustawienie domyślnego płatnika | `CLIENT_WRITE` |
| `GET` | `/customers/{id}/receiver-addresses` | aktywne adresy odbiorcy | `CLIENT_READ` |
| `POST` | `/customers/{id}/receiver-addresses` | nowy adres odbiorcy | `CLIENT_WRITE` |
| `PUT` | `/customers/{id}/receiver-addresses/{addressId}` | edycja (nowa wersja adresu) | `CLIENT_WRITE` |
| `DELETE` | `/customers/{id}/receiver-addresses/{addressId}` | usunięcie (soft delete) | `CLIENT_WRITE` |
| `PATCH` | `/customers/{id}/default-receiver/{addressId}` | ustawienie domyślnego odbiorcy | `CLIENT_WRITE` |

Historia zamówie klienta korzysta z listy zamówień sprzedażowych z filtrem `customerId`

## 2.4. Moduł DOSTAWCA

Dostawca ma dane firmy, kontakt i jeden adres siedziby.

Widoki to lista, formularz, szczegóły z edycją i hisorią zamówień zakupowych dostawcy.

| Metoda | Ścieżka | Opis | Uprawnienie |
| :--- | :--- | :--- | :--- |
| `GET` | `/suppliers?search=&active=` | lista dostawców | `SUPPLIER_READ` |
| `GET` | `/suppliers/{id}` | szczegóły | `SUPPLIER_READ` |
| `POST` | `/suppliers` | nowy dostawca | `SUPPLIER_WRIT` |
| `PUT` | `/suppliers/{id}` | edycja | `SUPPLIER_WRIT` |
| `DELETE` | `/suppliers/{id}` | dezaktywacja | `SUPPLIER_WRIT` |
| `PATCH` | `/suppliers/{id}/activate` | aktywacja | `SUPPLIER_WRIT` |

## 2.5. Moduł PRODUKT

Produkt to towar w konkretnym magazynie. Ten sam towar w dwóch magazynach to dwa wiersze z tym samym SKU (unikalność `(sku, warehouse_id)`). Produkt ma kategorię, ceny zakupu i sprzedaży, stawkę VAT (enum), jednostkę miary i minimalny stan.

Widoki to lista (wyszukiwanie, filtrowaie, wyróżnienie niskiego stanu), formularz, szczegóły z modalem edycji, tabla historii cen, formularz kategorii

| Metoda | Ścieżka | Opis | Uprawnienie |
| :--- | :--- | :--- | :--- |
| `GET` | `/products?search=&active=&categoryId=&warehouseId=` | lista produktów | `PRODUCT_READ` |
| `GET` | `/products/{id}` | szczegóły | `PRODUCT_READ` |
| `GET` | `/products/{id}/price-history` | historia zmian cen | `PRODUCT_READ` |
| `POST` | `/products` | nowy produkt | `PRODUCT_WRITE` |
| `PUT` | `/products/{id}` | edycja danych katalogowych | `PRODUCT_WRITE` |
| `DELETE` | `/products/{id}` | dezaktywacja | `PRODUCT_WRITE` |
| `PATCH` | `/products/{id}/activate` | aktywacja | `PRODUCT_WRITE` |
| `GET` | `/categories?active=` | lista kategorii | `PRODUCT_READ` |
| `POST` | `/categories` | nowa kategoria (unikalna nazwa) | `PRODUCT_WRITE` |
| `PUT` | `/categories/{id}` | zmiana nazwy | `PRODUCT_WRITE` |
| `DELETE` | `/categories/{id}` | dezaktywacja | `PRODUCT_WRITE` |


## 2.6. Moduł MAGAZYN

Magazyny to słownik miejsca składowania. Operacje magazynowe zmieniają `stock` w wierszu produktu i każda z nim zapisuje ruch magazynowy

Operacje:

- przyjęcie: wiele pozycji w jednej operacji, stan +
- wydanie: wiele pozycji w jednej operacji, stan − 
Operacja jest odrzucana, jeśli którakolwiek pozycja zeszłaby poniżej zera (cała operacja w jednej transakcji)
- przesunięcie: jeden produkt do innego magazynu. Jeśli w magazynie docelowym nie ma towaru o tym SKU, system zakłada nowy wiersz produktu (kopia danych katalogowych), w przeciwnym razie zwiększa istniejący stan
- niskie stany: widok SQL low_stock_products (stan <= minimum), opcjonalnie dla jednego magazynu.

Magazynu nie można dezaktywować, dopóki są w nim aktywne produkty.

Widoki to lista magazynów, formularz, szczegóły z produktami magazynu, strony przyjęcia, wydania i przesunięcia.

| Metoda | Ścieżka | Opis | Uprawnienie |
| :--- | :--- | :--- | :--- |
| `GET` | `/warehouses?search=&active=` | lista magazynów | `WAREHOUSE_READ` |
| `GET` | `/warehouses/{id}` | szczegóły | `WAREHOUSE_READ` |
| `POST` | `/warehouses` | nowy magazyn | `WAREHOUSE_MANAGE` |
| `PUT` | `/warehouses/{id}` | edycja | `WAREHOUSE_MANAGE` |
| `DELETE` | `/warehouses/{id}` | dezaktywacja | `WAREHOUSE_MANAGE` |
| `GET` | `/warehouses/low-stock?warehouseId=` | produkty poniżej minimum | `WAREHOUSE_READ` |
| `POST` | `/products/receive` | przyjęcie (lista {productId, quantity}) | `WAREHOUSE_OPERATE` |
| `POST` | `/products/issue` | wydanie (lista {productId, quantity}) | `WAREHOUSE_OPERATE` |
| `POST` | `/products/{id}/transfer` | przesunięcie (quantity, targetWarehouseId) | `WAREHOUSE_OPERATE` |

## 2.7. Moduł RUCHY MAGAZYNOWE

Dziennik wszystkich zmian stanu. Każdy ruch zapisuje typ (`PRZYJECIE`, `WYDANIE`, `PRZESUNIECIE`), produkt, magazyn, ilość wykonującego i datę. Nazwy produktu i magazynów są zapisywane jako snapshot z chwili ruchu więc późniejsza zmiana nazwy nie zmienia historii.

Pola `source_type` i `source_id` wskazują źródło ruchu np. `SALES_ORDER` z numerem zamówienia (wydanie przy realizacji, zwrot przy anulowaniu) albo `PURCHASE_ORDER` (przyjęcie dostawy). Puste pola oznaczają operację ręczną.

Widok to taela ruchów z filtrami (magazyn, typ, zakres dat)

| Metoda | Ścieżka | Opis | Uprawnienie |
| :--- | :--- | :--- | :--- |
| `GET` | `/stock-movements?productId=&warehouseId=&type=&from=&to=` | historia ruchów | `WAREHOUSE_READ` |

## 2.8. Moduł SPRZEDAŻ

Zamówienie sprzedażowe tworzy się dla klienta, z wyborem jednego z jego aktywnych adresów dostawy. Pozycje zapisują snapshot produktu czyli SKU, nazwę, cene sprzedaży, cene zakupu (do marży) i stawkę VAT. Sumy netto, VAT i brutto liczy backend i zapisuje je w nagłówku zamówienia.

Cykl życia (przejścia kontroluje backend)

```text
NEW ───► CONFIRMED ───► PROCESSING ───► READY ───► COMPLETED
 │            │              │            │
 └────────────┴──────────────┴────────────┴──────► CANCELLED
 ```

Każda zmiana statusu, w tym utworzenie, zapisuje się w historii statusów zamówienia (kto, kiedy, z jakiego na jaki status). Sczegóły zamówienia pokazują ją jako oś czasu.

Widoki to lista (filtru statusu i dat), formularz (autocomplete klienta i produktów, wybór adresu dostawy), szczegóły z przyciskami zmiany statusu, pozycjami, podsumowaniem i historią statusów.

| Metoda | Ścieżka | Opis | Uprawnienie |
| :--- | :--- | :--- | :--- |
| `GET` | `/sales-orders?customerId=&status=&from=&to=` | lista zamówień | `SALES_READ` |
| `GET` | `/sales-orders/{id}` | nagłówek zamówienia | `SALES_READ` |
| `GET` | `/sales-orders/{id}/items` | pozycje | `SALES_READ` |
| `GET` | `/sales-orders/{id}/history` | historia statusów | `SALES_READ` |
| `POST` | `/sales-orders` | nowe zamówienie | `SALES_WRITE` |
| `POST` | `/sales-orders/{id}/confirm` | → CONFIRMED | `SALES_WRITE` |
| `POST` | `/sales-orders/{id}/process` | → PROCESSING (wydanie) | `SALES_WRITE` |
| `POST` | `/sales-orders/{id}/ready` | → READY | `SALES_WRITE` |
| `POST` | `/sales-orders/{id}/complete` | → COMPLETED | `SALES_WRITE` |
| `POST` | `/sales-orders/{id}/cancel` | → CANCELLED (ew. zwrot) | `SALES_WRITE` |

## 2.9. Moduł ZAKUPY

Zamówienie do dostawcy ma jeden magazyn docelowy czyli jedno zamówienie -> jedna dostawa do jednego magazynu. Pozycje mogą zawierać wyłącznie produkty z tego magazynu, co backend sprawdza przy tworzeniu. Pozycje zapisują snapshot SKU, nazwy, ceny zakupu i VAT

Cykl życia:

```text
NEW → ORDERED → RECEIVED
  └──────┴──→ CANCELLED
```

Historia statusów działa tak samo jak w sprzedaży.

Widoki to lista, formularz (autocomplete dostawcy, wybór magazynu, produkty filtrowane do magazynu, szczegóły z przyciskami statusów i historią)

| Metoda | Ścieżka | Opis | Uprawnienie |
| :--- | :--- | :--- | :--- |
| `GET` | `/purchase-orders?supplierId=&status=&from=&to=` | lista zamówień | `PURCHASE_READ` |
| `GET` | `/purchase-orders/{id}` | nagłówek | `PURCHASE_READ` |
| `GET` | `/purchase-orders/{id}/items` | pozycje | `PURCHASE_READ` |
| `GET` | `/purchase-orders/{id}/history` | historia statusów | `PURCHASE_READ` |
| `POST` | `/purchase-orders` | nowe zamówienie | `PURCHASE_WRITE` |
| `POST` | `/purchase-orders/{id}/order` | → ORDERED | `PURCHASE_WRITE` |
| `POST` | `/purchase-orders/{id}/receive` | → RECEIVED (przyjęcie) | `PURCHASE_WRITE` |
| `POST` | `/purchase-orders/{id}/cancel` | → CANCELLED | `PURCHASE_WRITE` |

## 2.10. Moduł RAPORT

Jeden widok z zakładkami: Sprzedaż, Zakupy, Marża, Magazyn, Rankingi. Raporty okresowe mają filtr zakresu dat i zapytanie wysyłane przyciskiem „Filtruj".
Raporty sprzedaży i zakupów mają też granulację (dzień, tydzień, miesiąc) i wykres słupkowy.

- Sprzedaż w czasie
- Zakupy w czasie
- Najlepiej sprzedające się produkty i najaktywniejsi klienci
- Marża
- Stany magazynowe, wartość magazynu (osobno dla każdego), produkty poniżej minimum

| Metoda | Ścieżka | Parametry | Uprawnienie |
| :--- | :--- | :--- | :--- |
| `GET` | `/reports/sales` | `from`, `to`, `granularity=day\|week\|month` | `REPORT_READ` |
| `GET` | `/reports/purchases` | `from`, `to`, `granularity` | `REPORT_READ` |
| `GET` | `/reports/top-products` | `from`, `to` | `REPORT_READ` |
| `GET` | `/reports/top-customers` | `from`, `to` | `REPORT_READ` |
| `GET` | `/reports/margin` | `from`, `to` | `REPORT_READ` |
| `GET` | `/reports/stock-levels` | — | `REPORT_READ` |
| `GET` | `/reports/warehouse-value` | — (wartość per magazyn) | `REPORT_READ` |
| `GET` | `/reports/below-minimum` | — | `REPORT_READ` |


# 2.11. Moduł AUDIT LOG

Centralny log operacji w systmie. Wpis zawiera użytkownika, czas, akcję (np. `LOGIN_SUCCESS, LOGIN_FAILED, CREATE, UPDATE, ACTIVATE, DEACTIVATE, STATUS_CHANGE, STOCK_MOVEMENT`), typ encji i jej id oraz opis. Przy edycjach zapisywany jest też JSON z przesłanymi danymi, żeby było widać, co zmieniono. Serializowany jest DTO żądania, a nie encja, więc do logu nie trafiają pola wewnętrzne.

Zapis do dziennika jest wywoływane jawnie w serwisach. Historia statusów zamówień i ruchy magazynowe mają własne, szczegółowe tabele. Dziennik zawiera o nich tylko krótką informację.

| Metoda | Ścieżka | Parametry | Uprawnienie |
| :--- | :--- | :--- | :--- |
| `GET` | `/audit` | `action, entityType, from, to (daty yyyy-MM-dd)` | `AUDIT_READ` |

# 2.12. Moduł UŻYTKOWNIK

Zarządzanie kontami jest dostępne tylko dla administratora. Rola jest encją w bazie (ADMIN, MANAGER, USER) i przypisuje się ją po nazwie.

Zasady bezpieczeństwa:
- hashowane hasła (BCrypt)
- osobne DTO dla każdej operacji: tworzenie (z hasłem), edycja (imię i rola, bez hasła), reset hasła (tylko hasło), odpowiedź (bez hasła). Edycja fizycznie nie może zmienić hasła, a odpowiedź nie może zawierać hasha
- administrator nie może dezaktywować własnego konta
- login normalizowany do mały liter bez spacji

Widoki to lista z avatarami (inicjały), znacznikami ról i statusem, modale tworzenia, edycji roli i resetu hasła.

| Metoda | Ścieżka | Opis | Uprawnienie |
| :--- | :--- | :--- | :--- |
| `GET` | `/users` | lista użytkowników | `USER_MANAGE` |
| `POST` | `/users` | nowe konto | `USER_MANAGE` |
| `PUT` | `/users/{id}` | edycja imienia i roli | `USER_MANAGE` |
| `PATCH` | `/users/{id}/password` | reset hasła | `USER_MANAGE` |
| `PATCH` | `/users/{id}/activate` | aktywacja | `USER_MANAGE` |
| `DELETE` | `/users/{id}` | dezaktywacja | `USER_MANAGE` |


## 3. Interfejs (z konta Administratora)

## 3.1. Logowanie

![alt text](image.png)

## 3.2. Dashboard

![alt text](image-1.png)

## 3.3. Sprzedaż

Dane seedowane

### Lista klientów
![alt text](image-2.png)

### Zamówienia klientów
![alt text](image-3.png)

### Forumlarz dodawnia zamówienia
![alt text](image-4.png)

### Strona szczegółów
![alt text](image-5.png)

## 3.4. Zakupy

### Lista dostawców
![alt text](image-6.png)

### Zamówienia do dostawców
![alt text](image-7.png)

## Formularz dodawania dostawcy
![alt text](image-9.png)

### Forumlarz dodawnia zamówienia
![alt text](image-8.png)

### Strona szczegółów
![alt text](image-10.png)

## 3.5. Magazyn

### Lista magazynów
![alt text](image-11.png)

### Lista produktów
![alt text](image-12.png)

### Formularz dodawania produktu
![alt text](image-13.png)


## Formularz dodawania magazynu
![alt text](image-14.png)

### Szczegóły magazynu
![alt text](image-15.png)

## 3.6. Raporty
![alt text](image-16.png)

## 3.7. Audit log
![alt text](image-17.png)

## 3.8. Zarządzanie użytkownikami
![alt text](image-18.png)

# 4. Architektura

## 4.1. Diagram encji

```mermaid
erDiagram
    ROLES ||--o{ USERS : "has"
    ROLES ||--o{ ROLES_PERMISSIONS : "assigned to"
    PERMISSIONS ||--o{ ROLES_PERMISSIONS : "assigned to"

    CATEGORIES ||--o{ PRODUCTS : "categorizes"
    WAREHOUSES ||--o{ PRODUCTS : "stores"
    PRODUCTS ||--o{ PRICE_HISTORY : "tracks"
    PRODUCTS ||--o{ STOCK_MOVEMENTS : "moved in"

    WAREHOUSES ||--o{ STOCK_MOVEMENTS : "source / current"
    WAREHOUSES ||--o{ STOCK_MOVEMENTS : "target"

    CUSTOMERS ||--o{ PAYER_ADDRESSES : "has"
    CUSTOMERS ||--o{ RECEIVER_ADDRESSES : "has"
    CUSTOMERS |o--o| PAYER_ADDRESSES : "default payer"
    CUSTOMERS |o--o| RECEIVER_ADDRESSES : "default receiver"

    CUSTOMERS ||--o{ SALES_ORDERS : "places"
    RECEIVER_ADDRESSES ||--o{ SALES_ORDERS : "ships to"
    SALES_ORDERS ||--o{ SALES_ORDER_ITEMS : "contains"
    PRODUCTS ||--o{ SALES_ORDER_ITEMS : "ordered as"
    SALES_ORDERS ||--o{ SALES_ORDER_STATUS_HISTORY : "tracks status"

    SUPPLIERS ||--o{ PURCHASE_ORDERS : "supplies"
    WAREHOUSES ||--o{ PURCHASE_ORDERS : "delivers to"
    PURCHASE_ORDERS ||--o{ PURCHASE_ORDER_ITEMS : "contains"
    PRODUCTS ||--o{ PURCHASE_ORDER_ITEMS : "purchased as"
    PURCHASE_ORDERS ||--o{ PURCHASE_ORDER_STATUS_HISTORY : "tracks status"

    ROLES {
        bigint id PK
        varchar name UK
    }

    PERMISSIONS {
        bigint id PK
        varchar name UK
    }

    ROLES_PERMISSIONS {
        bigint role_id PK, FK
        bigint permission_id PK, FK
    }

    USERS {
        bigint id PK
        varchar username UK
        varchar password
        varchar full_name
        boolean enabled
        bigint role_id FK
        timestamp created_at
    }

    CATEGORIES {
        bigint id PK
        varchar name UK
        boolean active
    }

    WAREHOUSES {
        bigint id PK
        varchar name UK
        varchar phone
        varchar street
        varchar city
        varchar postal_code
        varchar country
        boolean active
    }

    PRODUCTS {
        bigint id PK
        varchar sku
        varchar name
        text description
        bigint category_id FK
        bigint warehouse_id FK
        numeric purchase_price
        numeric sale_price
        varchar vat_rate
        varchar unit
        integer min_stock
        integer stock
        boolean active
        bigint version
        timestamp created_at
    }

    PRICE_HISTORY {
        bigint id PK
        bigint product_id FK
        numeric old_purchase_price
        numeric new_purchase_price
        numeric old_sale_price
        numeric new_sale_price
        timestamp_with_time_zone changed_at
    }

    STOCK_MOVEMENTS {
        bigint id PK
        bigint product_id FK
        varchar type
        integer quantity
        bigint warehouse_id FK
        bigint target_warehouse_id FK
        varchar performed_by
        timestamp created_at
        varchar product_name
        varchar warehouse_name
        varchar target_warehouse_name
        varchar source_type
        bigint source_id
    }

    CUSTOMERS {
        bigint id PK
        varchar name
        varchar nip
        varchar email
        boolean active
        timestamp created_at
        bigint default_payer_id FK
        bigint default_receiver_id FK
    }

    PAYER_ADDRESSES {
        bigint id PK
        bigint customer_id FK
        varchar street
        varchar city
        varchar postal_code
        varchar country
        boolean active
    }

    RECEIVER_ADDRESSES {
        bigint id PK
        bigint customer_id FK
        varchar street
        varchar city
        varchar postal_code
        varchar country
        varchar phone
        boolean active
    }

    SUPPLIERS {
        bigint id PK
        varchar name
        varchar nip UK
        varchar phone
        varchar email
        varchar street
        varchar city
        varchar postal_code
        varchar country
        boolean active
        timestamp created_at
    }

    SALES_ORDERS {
        bigint id PK
        bigint customer_id FK
        bigint receiver_address_id FK
        varchar status
        numeric total_net
        numeric total_vat
        numeric total_gross
        varchar created_by
        timestamp created_at
    }

    SALES_ORDER_ITEMS {
        bigint id PK
        bigint order_id FK
        bigint product_id FK
        varchar sku
        varchar product_name
        integer quantity
        numeric unit_price
        numeric purchase_price
        varchar vat_rate
    }

    SALES_ORDER_STATUS_HISTORY {
        bigint id PK
        bigint order_id FK
        varchar from_status
        varchar to_status
        varchar changed_by
        timestamp changed_at
    }

    PURCHASE_ORDERS {
        bigint id PK
        bigint supplier_id FK
        bigint warehouse_id FK
        varchar status
        numeric total_net
        numeric total_vat
        numeric total_gross
        varchar created_by
        timestamp created_at
    }

    PURCHASE_ORDER_ITEMS {
        bigint id PK
        bigint order_id FK
        bigint product_id FK
        varchar sku
        varchar product_name
        integer quantity
        numeric purchase_price
        varchar vat_rate
    }

    PURCHASE_ORDER_STATUS_HISTORY {
        bigint id PK
        bigint order_id FK
        varchar from_status
        varchar to_status
        varchar changed_by
        timestamp changed_at
    }

    AUDIT_LOG {
        bigint id PK
        varchar action
        varchar entity_type
        bigint entity_id
        text details
        varchar performed_by
        timestamp created_at
    }
```


## 4.2. Backend

```text
com.mini_erp.backend
├── auth        – użytkownicy, role, uprawnienia, JWT, logowanie
├── catalog     – kategorie, produkty, historia cen, VatRate
├── customer    – klienci, adresy płatnika i odbiorcy
├── supplier    – dostawcy
├── warehouse   – magazyny, ruchy magazynowe, widok niskich stanów
├── sales       – zamówienia sprzedażowe
├── purchase    – zamówienia zakupowe
├── report      – raporty
├── dashboard   – podsumowanie na pulpit
├── audit       – dziennik zdarzeń
├── config      – SecurityConfig, OpenApiConfig
└── shared      – wyjątki, mappery MapStruct, DateRange
```
Każdy moduł ma tę samą strukturę warstw. Seedery danych testowych (`*Seeder` z profilem `dev`) leża w katalogu modułu

## 4.3. Frontend

```text
src
├── core/layouts/AppLayout.tsx    – rama aplikacji (boczne menu)
├── shared/
│   ├── components/               – Modal, ConfirmModal, ForbiddenPage, formStyles
│   └── services/                 – apiClient, auth
└── features/<moduł>/
    ├── components/  hooks/  schemas/  types/  views/
    └── route(s).tsx
```
Moduły frontendu to auth, dashboard, customers, suppliers, products, warehouses, sales, purchases, reports, users, audit. Router agreguje trasy z plików route.tsx poszczególnych modułów.

## 4.4. Uprawnienia

Użytkownik ma jedną rolę, a rola ma wiele uprawnień. Kązdy endpoint jest chroniony przez `@PreAuthorize("hasAuthority('...')")`. Brak tokena lub token nieprawidłowy daje 401, brak uprawnienia daje 403.

| Uprawnienie | ADMIN | MANAGER | USER |
| :--- | :---: | :---: | :---: |
| `PRODUCT_READ` / `CLIENT_READ` / `WAREHOUSE_READ` | ✓ | ✓ | ✓ |
| `SALES_READ` / `SALES_WRITE` | ✓ | ✓ | ✓ |
| `WAREHOUSE_OPERATE` (przyjęcie, wydanie, przesunięcie) | ✓ | ✓ | ✓ |
| `PRODUCT_WRITE`, `CLIENT_WRITE` | ✓ | ✓ | – |
| `SUPPLIER_READ` / `SUPPLIER_WRITE` | ✓ | ✓ | – |
| `PURCHASE_READ` / `PURCHASE_WRITE` | ✓ | ✓ | – |
| `WAREHOUSE_MANAGE` (CRUD magazynów, historia ruchów) | ✓ | ✓ | – |
| `REPORT_READ`, `AUDIT_READ` | ✓ | ✓ | – |
| `USER_MANAGE` | ✓ | – | – |

# 5. Uruchomienie

## 5.1 Konfiguracja

Sekrety są trzymane w pliku .env w katalogu głównym. Wzór znajduje się w .env.example. Minimalne zmienne to DB_NAME, DB_USER, DB_PASSWORD oraz dane konta administratora i sekret JWT. Dokładne nazwy są w .env.example.

## 5.2 Pełny stack w konterenach

`docker compose --profile full up -d --build`

- frontend: `localhost:3000`
- backend: `localhost:8080`
- Swagger UI: `localhost:8080/swagger-ui.html`

Frontend wywołuje API przez względne ścieżki. W kontenerze przekierowuje je nginx, w trybie dev proxy Vite

## 5.3 Tryb deweloperski

```
docker compose up -d postgres      # sama baza
cd backend && gradlew.bat bootRun  # backend na hoście
cd frontend && npm run dev         # frontend z hot reload
```
