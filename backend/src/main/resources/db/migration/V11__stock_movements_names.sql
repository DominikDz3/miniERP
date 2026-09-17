alter table stock_movements
    add column product_name           varchar(200),
    add column warehouse_name         varchar(150),
    add column target_warehouse_name  varchar(150);