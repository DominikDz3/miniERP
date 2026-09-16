insert into permissions (name) values ('WAREHOUSE_MANAGE');

insert into roles_permissions (role_id, permission_id)
select r.id, p.id
from roles r
join permissions p on p.name = 'WAREHOUSE_MANAGE'
where r.name in ('ADMIN', 'MANAGER');

insert into roles_permissions (role_id, permission_id)
select r.id, p.id
from roles r
join permissions p on p.name = 'WAREHOUSE_OPERATE'
where r.name = 'USER';