create table roles (
    id   bigint generated always as identity primary key,
    name varchar(50) not null unique
);

create table permissions (
    id   bigint generated always as identity primary key,
    name varchar(64) not null unique
);

create table users (
    id         bigint generated always as identity primary key,
    username   varchar(50)  not null unique,
    password   varchar(100) not null,
    full_name  varchar(120) not null,
    enabled    boolean      not null default true,
    role_id    bigint       not null references roles(id),
    created_at timestamp    not null default now()
);

create table roles_permissions (
    role_id       bigint not null references roles(id) on delete cascade,
    permission_id bigint not null references permissions(id) on delete cascade,
    primary key (role_id, permission_id)
);

-- seed - permissions
insert into permissions (name) values
  ('PRODUCT_READ'), ('PRODUCT_WRITE'),
  ('CLIENT_READ'),  ('CLIENT_WRITE'),
  ('SUPPLIER_READ'),('SUPPLIER_WRITE'),
  ('WAREHOUSE_READ'),('WAREHOUSE_OPERATE'),
  ('SALES_READ'),   ('SALES_WRITE'),
  ('PURCHASE_READ'),('PURCHASE_WRITE'),
  ('REPORT_READ'),  ('AUDIT_READ'),
  ('USER_MANAGE');

insert into roles (name) values ('ADMIN'), ('MANAGER'), ('USER');

-- ADMIN - all permissions
insert into roles_permissions (role_id, permission_id)
select r.id, p.id from roles r cross join permissions p
where r.name = 'ADMIN';

-- MANAGER - all permissions except account management
insert into roles_permissions (role_id, permission_id)
select r.id, p.id from roles r join permissions p on p.name <> 'USER_MANAGE'
where r.name = 'MANAGER';

-- USER - reading and sell orders management
insert into roles_permissions (role_id, permission_id)
select r.id, p.id from roles r join permissions p
  on p.name in ('PRODUCT_READ','CLIENT_READ','WAREHOUSE_READ','SALES_READ','SALES_WRITE')
where r.name = 'USER';
