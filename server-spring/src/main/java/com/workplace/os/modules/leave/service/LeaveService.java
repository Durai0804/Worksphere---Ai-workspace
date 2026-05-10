package com.workplace.os.modules.leave.service;

import com.workplace.os.common.dto.PagedResponse;
import com.workplace.os.exception.BadRequestException;
import com.workplace.os.exception.ResourceNotFoundException;
import com.workplace.os.modules.leave.dto.*;
import com.workplace.os.modules.leave.entity.LeaveRequest;
import com.workplace.os.modules.leave.entity.LeaveStatus;
import com.workplace.os.modules.leave.entity.LeaveType;
import com.workplace.os.modules.leave.repository.LeaveRequestRepository;
import com.workplace.os.modules.employee.entity.Employee;
import com.workplace.os.modules.employee.repository.EmployeeRepository;
import com.workplace.os.modules.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Year;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

    // Default leave quotas per year
    private static final Map<LeaveType, Integer> LEAVE_QUOTAS = Map.of(
            LeaveType.CASUAL, 12, LeaveType.SICK, 10, LeaveType.ANNUAL, 15,
            LeaveType.MATERNITY, 180, LeaveType.PATERNITY, 15, LeaveType.UNPAID, 30
    );

    @Transactional
    public LeaveResponse applyLeave(Long employeeId, LeaveApplyRequest request) {
        Employee employee = findEmployee(employeeId);
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date must be after start date");
        }
        LeaveRequest leave = LeaveRequest.builder()
                .employee(employee).leaveType(request.getLeaveType())
                .startDate(request.getStartDate()).endDate(request.getEndDate())
                .reason(request.getReason()).status(LeaveStatus.PENDING).build();
        leave = leaveRepository.save(leave);
        log.info("Leave applied by {} — {} from {} to {}", employee.getFullName(), request.getLeaveType(), request.getStartDate(), request.getEndDate());
        notificationService.createNotification(null, "New Leave Request",
                employee.getFullName() + " applied for " + request.getLeaveType() + " leave", "LEAVE_REQUEST");
        return mapToResponse(leave);
    }

    @Transactional
    public LeaveResponse updateLeaveStatus(Long leaveId, Long approverId, LeaveStatusUpdateRequest request) {
        LeaveRequest leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request", "id", leaveId));
        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("This leave request has already been " + leave.getStatus().name().toLowerCase());
        }
        leave.setStatus(request.getStatus());
        leave.setApprovedBy(approverId);
        if (request.getStatus() == LeaveStatus.REJECTED) {
            leave.setRejectionReason(request.getRejectionReason());
        }
        leave = leaveRepository.save(leave);
        String statusText = request.getStatus() == LeaveStatus.APPROVED ? "approved" : "rejected";
        notificationService.createNotification(leave.getEmployee().getId(), "Leave " + statusText,
                "Your " + leave.getLeaveType() + " leave has been " + statusText, "LEAVE_" + request.getStatus().name());
        return mapToResponse(leave);
    }

    @Transactional(readOnly = true)
    public PagedResponse<LeaveResponse> getLeavesByEmployee(Long employeeId, int page, int size) {
        Page<LeaveRequest> p = leaveRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId, PageRequest.of(page, size));
        return buildPagedResponse(p);
    }

    @Transactional(readOnly = true)
    public PagedResponse<LeaveResponse> getLeavesByStatus(LeaveStatus status, int page, int size) {
        Page<LeaveRequest> p = leaveRepository.findByStatusOrderByCreatedAtDesc(status, PageRequest.of(page, size));
        return buildPagedResponse(p);
    }

    @Transactional(readOnly = true)
    public LeaveBalanceResponse getLeaveBalance(Long employeeId) {
        int currentYear = Year.now().getValue();
        Map<String, LeaveBalanceResponse.LeaveQuota> balances = new LinkedHashMap<>();
        for (Map.Entry<LeaveType, Integer> entry : LEAVE_QUOTAS.entrySet()) {
            long used = leaveRepository.countApprovedLeaveDays(employeeId, entry.getKey(), currentYear);
            balances.put(entry.getKey().name(), LeaveBalanceResponse.LeaveQuota.builder()
                    .total(entry.getValue()).used(used).remaining(Math.max(0, entry.getValue() - used)).build());
        }
        return LeaveBalanceResponse.builder().balances(balances).build();
    }

    private Employee findEmployee(Long id) {
        return employeeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
    }

    private LeaveResponse mapToResponse(LeaveRequest l) {
        long days = ChronoUnit.DAYS.between(l.getStartDate(), l.getEndDate()) + 1;
        return LeaveResponse.builder().id(l.getId()).employeeId(l.getEmployee().getId())
                .employeeName(l.getEmployee().getFullName()).leaveType(l.getLeaveType())
                .startDate(l.getStartDate()).endDate(l.getEndDate()).totalDays(days)
                .reason(l.getReason()).status(l.getStatus()).approvedBy(l.getApprovedBy())
                .rejectionReason(l.getRejectionReason()).createdAt(l.getCreatedAt()).build();
    }

    private PagedResponse<LeaveResponse> buildPagedResponse(Page<LeaveRequest> p) {
        return PagedResponse.<LeaveResponse>builder()
                .content(p.getContent().stream().map(this::mapToResponse).toList())
                .page(p.getNumber()).size(p.getSize()).totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages()).last(p.isLast()).build();
    }
}
