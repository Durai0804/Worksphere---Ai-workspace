package com.workplace.os.modules.leave.dto;

import com.workplace.os.modules.leave.entity.LeaveStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LeaveStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private LeaveStatus status;

    private String rejectionReason;
}
