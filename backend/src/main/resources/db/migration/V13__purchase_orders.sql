create table purchase_orders (
    id           bigint generated always as identity primary key,
    supplier_id  bigint        not null references suppliers(id),
    warehouse_id bigint        not null references warehouses(id),
    status       varchar(20)   not null
                 check (status in ('NEW','ORDERED','RECEIVED','CANCELLED')),
    total_net    numeric(19,4) not null default 0,
    total_vat    numeric(19,4) not null default 0,
    total_gross  numeric(19,4) not null default 0,
    created_by   varchar(100)  not null,
    created_at   timestamp     not null default now()
);

create table purchase_order_items (
    id             bigint generated always as identity primary key,
    order_id       bigint        not null references purchase_orders(id) on delete cascade,
    product_id     bigint        not null references products(id),
    sku            varchar(64)   not null,
    product_name   varchar(200)  not null,
    quantity       integer       not null check (quantity > 0),
    purchase_price numeric(19,4) not null,
    vat_rate       numeric(5,2)  not null,
    constraint uq_po_order_product unique (order_id, product_id)
);

create table purchase_order_status_history (
    id          bigint generated always as identity primary key,
    order_id    bigint       not null references purchase_orders(id) on delete cascade,
    from_status varchar(20),
    to_status   varchar(20)  not null,
    changed_by  varchar(100) not null,
    changed_at  timestamp    not null default now()
);

create index idx_purchase_orders_supplier_id on purchase_orders(supplier_id);
create index idx_purchase_orders_warehouse_id on purchase_orders(warehouse_id);
create index idx_po_items_order_id on purchase_order_items(order_id);
create index idx_po_history_order_id on purchase_order_status_history(order_id);