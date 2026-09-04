create table customers (
    id          bigint generated always as identity primary key,
    name        varchar(200)    not null,
    nip         varchar(15),
    street      varchar(200)    not null,
    city        varchar(100)    not null,
    postal_code varchar(10)     not null,
    country     varchar(60)     not null default 'Polska',
    email       varchar(150)    not null,
    phone       varchar(30)     not null,
    active      boolean         not null default true,
    created_at  timestamp       not null default now()
);

create index idx_customers_name on customers (name);
create index idx_customers_city on customers (city);
create unique index uq_customers_nip on customers (nip) where nip is not null;