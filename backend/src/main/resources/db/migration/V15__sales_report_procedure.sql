create or replace function sp_sales_report(
    p_from timestamp,
    p_to   timestamp,
    p_granularity text
)
returns table (
    period       timestamp,
    orders_count bigint,
    total_net    numeric,
    total_gross  numeric
)
language plpgsql
as $$
begin
    return query
        select
            date_trunc(p_granularity, o.created_at) as period,
            count(*)                                as orders_count,
            sum(o.total_net)                        as total_net,
            sum(o.total_gross)                      as total_gross
        from sales_orders o
        where o.status = 'COMPLETED'
          and o.created_at >= p_from
          and o.created_at <= p_to
        group by date_trunc(p_granularity, o.created_at)
        order by period;
end;
$$;