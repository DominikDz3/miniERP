create table customers (
    id                  bigint generated always as identity primary key,
    name                varchar(200)    not null,
    nip                 varchar(15),
    email               varchar(150)    not null,
    active              boolean         not null default true,
    created_at          timestamp       not null default now(),
    default_payer_id    bigint,
    default_receiver_id bigint
);

create index idx_customers_name on customers (name);
create index uq_customers_nip on customers (nip) where nip is not null;

create table payer_addresses (
    id          bigint generated always as identity primary key,
    customer_id bigint not null references customers(id) on delete cascade,
    street      varchar(200) not null,
    city        varchar(100) not null,
    postal_code varchar(10)  not null,
    country     varchar(60)  not null
);

create table receiver_addresses (
    id          bigint generated always as identity primary key,
    customer_id bigint not null references customers(id) on delete cascade,
    street      varchar(200) not null,
    city        varchar(100) not null,
    postal_code varchar(10)  not null,
    country     varchar(60)  not null,
    phone       varchar(30)  not null
);

create index idx_payer_addr_customer on payer_addresses (customer_id);
create index idx_receiver_addr_customer on receiver_addresses (customer_id);

alter table customers
    add constraint fk_customers_default_payer
        foreign key (default_payer_id) references payer_addresses(id),
    add constraint fk_customers_default_receiver
        foreign key (default_receiver_id) references receiver_addresses(id);