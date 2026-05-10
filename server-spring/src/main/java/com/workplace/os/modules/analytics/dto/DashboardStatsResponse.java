package com.workplace.os.modules.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Dashboard statistics response — aggregated metrics for the dashboard page.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    // Employee stats
    private long totalEmployees;
    private long activeEmployees;
    private Map<String, Long> employeesByDepartment;
    private Map<String, Long> employeesByRole;

    // Attendance stats (today)
    private long presentToday;
    private long absentToday;
    private long lateToday;
    private double attendanceRate;

    // Leave stats
    private long pendingLeaveRequests;
    private long approvedLeavesThisMonth;

    // Task stats
    private long totalTasks;
    private long completedTasks;
    private long overdueTasks;
    private Map<String, Long> tasksByStatus;
}
