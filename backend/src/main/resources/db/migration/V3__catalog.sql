create table categories (
    id      bigint generated always as identity primary key,
    name    varchar(100) not null unique,
    active  boolean      not null default true
);

create table products (
    id              bigint generated always as identity primary key,
    sku             varchar(64)   not null unique,  -- product code
    name            varchar(200)  not null,
    description     text,
    category_id     bigint        not null references categories(id),
    purchase_price  numeric(19,4) not null,
    sale_price      numeric(19,4) not null,
    vat_rate        numeric(5,2)  not null,
    unit            varchar(20)   not null,
    min_stock       numeric(19,3) not null default 0,
    active          boolean       not null default true,
    version         bigint        not null default 0,
    created_at      timestamptz   not null default now()
);

create index idx_products_category_id on products(category_id);
create index idx_products_active on products(active);