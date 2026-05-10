package com.workplace.os.modules.attendance.controller;

import com.workplace.os.common.dto.ApiResponse;
import com.workplace.os.common.dto.PagedResponse;
import com.workplace.os.modules.attendance.dto.AttendanceResponse;
import com.workplace.os.modules.attendance.dto.MonthlySummaryResponse;
import com.workplace.os.modules.attendance.service.AttendanceService;
import com.workplace.os.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance", description = "Clock in/out and attendance tracking")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/checkin")
    @Operation(summary = "Clock in for today")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkIn(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("Checked in", attendanceService.checkIn(user.getId())));
    }

    @PostMapping("/checkout")
    @Operation(summary = "Clock out for today")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkOut(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("Checked out", attendanceService.checkOut(user.getId())));
    }

    @GetMapping("/today")
    @Operation(summary = "Get today's attendance status")
    public ResponseEntity<ApiResponse<AttendanceResponse>> getTodayStatus(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getTodayStatus(user.getId())));
    }

    @GetMapping("/history")
    @Operation(summary = "Get attendance history with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<AttendanceResponse>>> getHistory(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getHistory(user.getId(), page, size)));
    }

    @GetMapping("/monthly-summary")
    @Operation(summary = "Get monthly attendance summary")
    public ResponseEntity<ApiResponse<MonthlySummaryResponse>> getMonthlySummary(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        int y = year != null ? year : LocalDate.now().getYear();
        int m = month != null ? month : LocalDate.now().getMonthValue();
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getMonthlySummary(user.getId(), y, m)));
    }
}
