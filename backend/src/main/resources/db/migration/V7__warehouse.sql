create table warehouses (
    id  bigint generated always as identity primary key,
    name        varchar(150)    not null unique,
    phone       varchar(30)     not null,
    street      varchar(200)    not null,
    city        varchar(100)    not null,
    postal_code varchar(10)     not null,
    country     varchar(60)     not null,
    active      boolean         not null default true
);

alter table products add column warehouse_id bigint not null references warehouses(id);

alter table products add constraint uq_products_sku_warehouse unique (sku, warehouse_id);

create index idx_products_warehouse_id on products(warehouse_id);