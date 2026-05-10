package com.workplace.os.modules.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlySummaryResponse {

    private int year;
    private int month;
    private long totalDays;
    private long presentDays;
    private long absentDays;
    private long lateDays;
    private long halfDays;
    private long leaveDays;
    private Map<String, Long> breakdown; // status -> count
}
