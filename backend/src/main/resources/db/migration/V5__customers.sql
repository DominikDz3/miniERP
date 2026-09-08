create table customers (
    id          bigint generated always as identity primary key,
    name        varchar(200)    not null,
    nip         varchar(15),
    email       varchar(150)    not null,
    active      boolean         not null default true,
    created_at  timestamp       not null default now()
);

create index idx_customers_name on customers (name);
create index uq_customers_nip on customers (nip) where nip is not null;

create table payer_addresses (
    id          bigint generated always as identity primary key,
    customer_id bigint not null references customers(id) on delete cascade,
    is_default  boolean      not null default false,
    street      varchar(200) not null,
    city        varchar(100) not null,
    postal_code varchar(10)  not null,
    country     varchar(60)  not null default 'Polska'
);

create table receiver_addresses (
    id          bigint generated always as identity primary key,
    customer_id bigint not null references customers(id) on delete cascade,
    is_default  boolean      not null default false,
    street      varchar(200) not null,
    city        varchar(100) not null,
    postal_code varchar(10)  not null,
    country     varchar(60)  not null default 'Polska',
    phone       varchar(30)  not null
);

create index idx_payer_addr_customer on payer_addresses (customer_id);
create index idx_receiver_addr_customer on receiver_addresses (customer_id);

create unique index uq_payer_default on payer_addresses (customer_id) where is_default;
create unique index uq_receiver_default on receiver_addresses (customer_id) where is_default;