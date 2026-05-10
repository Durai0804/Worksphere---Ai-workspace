package com.workplace.os.modules.analytics.service;

import com.workplace.os.modules.analytics.dto.DashboardStatsResponse;
import com.workplace.os.modules.attendance.entity.AttendanceStatus;
import com.workplace.os.modules.attendance.repository.AttendanceRepository;
import com.workplace.os.modules.employee.entity.EmployeeStatus;
import com.workplace.os.modules.employee.repository.EmployeeRepository;
import com.workplace.os.modules.leave.entity.LeaveStatus;
import com.workplace.os.modules.leave.repository.LeaveRequestRepository;
import com.workplace.os.modules.task.entity.TaskStatus;
import com.workplace.os.modules.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRepository;
    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        LocalDate today = LocalDate.now();
        long totalEmployees = employeeRepository.count();
        long activeEmployees = employeeRepository.countByStatus(EmployeeStatus.ACTIVE);
        long presentToday = attendanceRepository.countByDateAndStatus(today, AttendanceStatus.PRESENT);
        long lateToday = attendanceRepository.countByDateAndStatus(today, AttendanceStatus.LATE);
        long totalToday = attendanceRepository.countByDate(today);
        double attendanceRate = totalEmployees > 0 ? (presentToday + lateToday) * 100.0 / activeEmployees : 0;

        Map<String, Long> tasksByStatus = new LinkedHashMap<>();
        for (TaskStatus s : TaskStatus.values()) tasksByStatus.put(s.name(), taskRepository.countByStatus(s));

        long overdueTasks = taskRepository.findByDeadlineBeforeAndStatusNot(today, TaskStatus.COMPLETED).size();

        return DashboardStatsResponse.builder()
                .totalEmployees(totalEmployees).activeEmployees(activeEmployees)
                .presentToday(presentToday).absentToday(activeEmployees - presentToday - lateToday)
                .lateToday(lateToday).attendanceRate(Math.round(attendanceRate * 100.0) / 100.0)
                .pendingLeaveRequests(leaveRepository.countByStatus(LeaveStatus.PENDING))
                .totalTasks(taskRepository.count()).completedTasks(taskRepository.countByStatus(TaskStatus.COMPLETED))
                .overdueTasks(overdueTasks).tasksByStatus(tasksByStatus).build();
    }
}
