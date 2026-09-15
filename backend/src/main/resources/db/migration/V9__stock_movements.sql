create table stock_movements (
    id                  bigint generated always as identity primary key,
    product_id          bigint       not null references products(id),
    type                varchar(20)  not null
                        check (type in ('PRZYJECIE', 'WYDANIE', 'PRZESUNIECIE')),
    quantity            integer      not null check (quantity > 0),
    warehouse_id        bigint       not null references warehouses(id),
    target_warehouse_id bigint       references warehouses(id),
    performed_by        varchar(100) not null,
    created_at          timestamp    not null default now()
);

create index idx_stock_movements_product_id on stock_movements(product_id);
create index idx_stock_movements_created_at on stock_movements(created_at);