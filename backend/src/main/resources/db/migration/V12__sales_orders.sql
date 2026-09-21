create table sales_orders (
    id          bigint generated always as identity primary key,
    customer_id bigint        not null references customers(id),
    receiver_address_id bigint not null references receiver_addresses(id),
    status      varchar(20)   not null
                check (status in ('NEW','CONFIRMED','PROCESSING','READY','COMPLETED','CANCELLED')),
    total_net   numeric(19,4) not null default 0,
    total_vat   numeric(19,4) not null default 0,
    total_gross numeric(19,4) not null default 0,
    created_by  varchar(100)  not null,
    created_at  timestamp     not null default now()
);

create table sales_order_items (
    id            bigint generated always as identity primary key,
    order_id      bigint        not null references sales_orders(id),
    product_id    bigint        not null references products(id),
    sku           varchar(64)   not null,
    product_name  varchar(200)  not null,
    quantity      integer       not null check (quantity > 0),
    unit_price    numeric(19,4) not null,
    vat_rate      varchar(10)  not null,
    constraint uq_order_product unique (order_id, product_id)
);

create table sales_order_status_history (
    id          bigint generated always as identity primary key,
    order_id    bigint       not null references sales_orders(id),
    from_status varchar(20),
    to_status   varchar(20)  not null,
    changed_by  varchar(100) not null,
    changed_at  timestamp    not null default now()
);

alter table stock_movements
    add column source_type varchar(20),
    add column source_id   bigint;

create index idx_sales_orders_customer_id on sales_orders(customer_id);
create index idx_sales_order_items_order_id on sales_order_items(order_id);

create index idx_sales_orders_active_status on sales_orders(status)
    where status not in ('COMPLETED','CANCELLED');

create index idx_stock_movements_source on stock_movements(source_type, source_id)
    where source_type is not null;

    create index idx_sos_history_order_id on sales_order_status_history(order_id);