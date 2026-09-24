package com.mini_erp.backend.sales.domain;

public enum SalesOrderStatus {
    NEW, CONFIRMED, PROCESSING, READY, COMPLETED, CANCELLED;

    public String label() {
        return switch (this) {
            case NEW        -> "Nowe";
            case CONFIRMED  -> "Potwierdzone";
            case PROCESSING -> "W realizacji";
            case READY      -> "Gotowe";
            case COMPLETED  -> "Zrealizowane";
            case CANCELLED  -> "Anulowane";
        };
    }
}
