package com.mini_erp.backend.shared.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public final class DateRange {

    private DateRange() {}

    public static LocalDateTime from(LocalDate date) {
        return (date != null) ? date.atStartOfDay() : LocalDate.of(1970, 1, 1).atStartOfDay();
    }

    public static LocalDateTime to(LocalDate date) {
        return (date != null) ? date.atTime(LocalTime.MAX) : LocalDateTime.now();
    }
}