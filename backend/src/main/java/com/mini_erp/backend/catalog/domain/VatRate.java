package com.mini_erp.backend.catalog.domain;

public enum VatRate {
    VAT_23(23), VAT_8(8), VAT_5(5), VAT_0(0);

    private final int percent;

    VatRate(int percent) { this.percent = percent; }
    public int getPercent() { return percent; }
}