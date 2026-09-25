package com.mini_erp.backend.audit.domain;

public enum AuditAction {
    LOGIN_SUCCESS, LOGIN_FAILED,
    CREATE, UPDATE, ACTIVATE, DEACTIVATE,
    STATUS_CHANGE, STOCK_MOVEMENT, PASSWORD_RESET
}