package com.workplace.os.modules.leave.dto;

import com.workplace.os.modules.leave.entity.LeaveStatus;
import com.workplace.os.modules.leave.entity.LeaveType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveResponse {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private LeaveType leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private long totalDays;
    private String reason;
    private LeaveStatus status;
    private Long approvedBy;
    private String rejectionReason;
    private LocalDateTime createdAt;
}
