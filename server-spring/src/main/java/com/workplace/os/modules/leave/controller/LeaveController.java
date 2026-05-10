package com.workplace.os.modules.leave.controller;

import com.workplace.os.common.dto.ApiResponse;
import com.workplace.os.common.dto.PagedResponse;
import com.workplace.os.modules.leave.dto.*;
import com.workplace.os.modules.leave.entity.LeaveStatus;
import com.workplace.os.modules.leave.service.LeaveService;
import com.workplace.os.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/leaves")
@RequiredArgsConstructor
@Tag(name = "Leave Management", description = "Apply, approve/reject leaves")
public class LeaveController {

    private final LeaveService leaveService;

    @PostMapping
    @Operation(summary = "Apply for leave")
    public ResponseEntity<ApiResponse<LeaveResponse>> applyLeave(
            @AuthenticationPrincipal CustomUserDetails user, @Valid @RequestBody LeaveApplyRequest request) {
        LeaveResponse response = leaveService.applyLeave(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Leave applied", response));
    }

    @GetMapping
    @Operation(summary = "Get my leave requests")
    public ResponseEntity<ApiResponse<PagedResponse<LeaveResponse>>> getMyLeaves(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(leaveService.getLeavesByEmployee(user.getId(), page, size)));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get all pending leave requests (Admin/HR)")
    public ResponseEntity<ApiResponse<PagedResponse<LeaveResponse>>> getPendingLeaves(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(leaveService.getLeavesByStatus(LeaveStatus.PENDING, page, size)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Approve or reject a leave request (Admin/HR)")
    public ResponseEntity<ApiResponse<LeaveResponse>> updateLeaveStatus(
            @PathVariable Long id, @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody LeaveStatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Leave status updated",
                leaveService.updateLeaveStatus(id, user.getId(), request)));
    }

    @GetMapping("/balance")
    @Operation(summary = "Get leave balance for current user")
    public ResponseEntity<ApiResponse<LeaveBalanceResponse>> getLeaveBalance(
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(leaveService.getLeaveBalance(user.getId())));
    }
}
