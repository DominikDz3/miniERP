package com.mini_erp.backend.purchase.domain;

public enum PurchaseOrderStatus {
    NEW, ORDERED, RECEIVED, CANCELLED;

    public String label() {
            return switch (this) {
                case NEW       -> "Nowe";
                case ORDERED   -> "Zamówione";
                case RECEIVED  -> "Przyjęte";
                case CANCELLED -> "Anulowane";
            };
        }
}