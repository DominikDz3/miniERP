create table audit_log (
    id           bigint generated always as identity primary key,
    action       varchar(30)  not null,
    entity_type  varchar(30),
    entity_id    bigint,
    details      text          not null,
    performed_by varchar(50)  not null,
    created_at   timestamp    not null default now()
);

create index idx_audit_log_created_at on audit_log(created_at);
create index idx_audit_log_entity on audit_log(entity_type, entity_id);