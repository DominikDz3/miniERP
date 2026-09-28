alter table payer_addresses
    add column active boolean not null default true;

alter table receiver_addresses
    add column active boolean not null default true;