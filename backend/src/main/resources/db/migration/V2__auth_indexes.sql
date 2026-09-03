create index idx_users_role_id on users(role_id);

create index idx_roles_permissions_permission on roles_permissions(permission_id);