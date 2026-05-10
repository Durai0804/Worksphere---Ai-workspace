package com.workplace.os.modules.attendance.service;

import com.workplace.os.common.dto.PagedResponse;
import com.workplace.os.exception.BadRequestException;
import com.workplace.os.exception.ResourceNotFoundException;
import com.workplace.os.modules.attendance.dto.AttendanceResponse;
import com.workplace.os.modules.attendance.dto.MonthlySummaryResponse;
import com.workplace.os.modules.attendance.entity.Attendance;
import com.workplace.os.modules.attendance.entity.AttendanceStatus;
import com.workplace.os.modules.attendance.repository.AttendanceRepository;
import com.workplace.os.modules.employee.entity.Employee;
import com.workplace.os.modules.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public AttendanceResponse checkIn(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        LocalDate today = LocalDate.now();
        if (attendanceRepository.findByEmployeeIdAndDate(employeeId, today).isPresent()) {
            throw new BadRequestException("You have already checked in today");
        }
        Attendance attendance = Attendance.builder()
                .employee(employee).date(today)
                .checkInTime(LocalDateTime.now())
                .status(AttendanceStatus.PRESENT).build();
        attendance = attendanceRepository.save(attendance);
        log.info("Check-in: {} at {}", employee.getFullName(), attendance.getCheckInTime());
        return mapToResponse(attendance);
    }

    @Transactional
    public AttendanceResponse checkOut(Long employeeId) {
        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                .orElseThrow(() -> new BadRequestException("You haven't checked in today"));
        if (attendance.getCheckOutTime() != null) {
            throw new BadRequestException("You have already checked out today");
        }
        LocalDateTime now = LocalDateTime.now();
        attendance.setCheckOutTime(now);
        double hours = Duration.between(attendance.getCheckInTime(), now).toMinutes() / 60.0;
        attendance.setHoursWorked(Math.round(hours * 100.0) / 100.0);
        attendance = attendanceRepository.save(attendance);
        return mapToResponse(attendance);
    }

    @Transactional(readOnly = true)
    public AttendanceResponse getTodayStatus(Long employeeId) {
        LocalDate today = LocalDate.now();
        return attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                .map(this::mapToResponse)
                .orElse(AttendanceResponse.builder().employeeId(employeeId).date(today).status(AttendanceStatus.ABSENT).build());
    }

    @Transactional(readOnly = true)
    public PagedResponse<AttendanceResponse> getHistory(Long employeeId, int page, int size) {
        Page<Attendance> p = attendanceRepository.findByEmployeeIdOrderByDateDesc(employeeId, PageRequest.of(page, size));
        return PagedResponse.<AttendanceResponse>builder()
                .content(p.getContent().stream().map(this::mapToResponse).toList())
                .page(p.getNumber()).size(p.getSize())
                .totalElements(p.getTotalElements()).totalPages(p.getTotalPages()).last(p.isLast()).build();
    }

    @Transactional(readOnly = true)
    public MonthlySummaryResponse getMonthlySummary(Long employeeId, int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        List<Object[]> summary = attendanceRepository.getMonthlySummary(employeeId, start, end);
        Map<String, Long> breakdown = new HashMap<>();
        long present = 0, absent = 0, late = 0, halfDay = 0, onLeave = 0;
        for (Object[] row : summary) {
            AttendanceStatus s = (AttendanceStatus) row[0]; Long c = (Long) row[1];
            breakdown.put(s.name(), c);
            switch (s) { case PRESENT -> present=c; case ABSENT -> absent=c; case LATE -> late=c; case HALF_DAY -> halfDay=c; case ON_LEAVE -> onLeave=c; }
        }
        return MonthlySummaryResponse.builder().year(year).month(month).totalDays(start.lengthOfMonth())
                .presentDays(present).absentDays(absent).lateDays(late).halfDays(halfDay).leaveDays(onLeave).breakdown(breakdown).build();
    }

    private AttendanceResponse mapToResponse(Attendance a) {
        return AttendanceResponse.builder().id(a.getId()).employeeId(a.getEmployee().getId())
                .employeeName(a.getEmployee().getFullName()).date(a.getDate())
                .checkInTime(a.getCheckInTime()).checkOutTime(a.getCheckOutTime())
                .hoursWorked(a.getHoursWorked()).status(a.getStatus()).notes(a.getNotes()).build();
    }
}
