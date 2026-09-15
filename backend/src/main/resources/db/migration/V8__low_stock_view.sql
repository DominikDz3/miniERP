create view low_Stock_products as
select  p.id            as product_id,
        p.sku           as sku,
        p.name          as product_name,
        p.stock         as stock,
        p.min_stock     as min_stock,
        p.warehouse_id  as warehouse_id,
        w.name          as warehouse_name
from products p
join warehouses w on w.id = p.warehouse_id
where p.active = true and p.stock <= p.min_stock;