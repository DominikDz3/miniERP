create table price_history (
    id             bigint generated always as identity primary key,
    product_id     bigint not null references products(id),
    old_purchase_price numeric(19,4),
    new_purchase_price numeric(19,4),
    old_sale_price     numeric(19,4),
    new_sale_price     numeric(19,4),
    changed_at     timestamp with time zone not null default now()
);

create index idx_price_history_product on price_history(product_id);

-- triggera: save row when price changed
create or replace function log_price_change()
returns trigger as $$
begin
    if (old.purchase_price is distinct from new.purchase_price)
       or (old.sale_price is distinct from new.sale_price) then
        insert into price_history (
            product_id,
            old_purchase_price, new_purchase_price,
            old_sale_price, new_sale_price
        ) values (
            new.id,
            old.purchase_price, new.purchase_price,
            old.sale_price, new.sale_price
        );
    end if;
    return new;
end;
$$ language plpgsql;

-- trigger: run function after product update
create trigger trg_log_price_change
    after update on products
    for each row
    execute function log_price_change();