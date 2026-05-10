package com.workplace.os.modules.task.controller;

import com.workplace.os.common.dto.ApiResponse;
import com.workplace.os.common.dto.PagedResponse;
import com.workplace.os.modules.task.dto.*;
import com.workplace.os.modules.task.entity.TaskStatus;
import com.workplace.os.modules.task.service.TaskService;
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
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@Tag(name = "Task Management", description = "Assign, track, and manage tasks")
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Create and assign a new task")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @AuthenticationPrincipal CustomUserDetails user, @Valid @RequestBody TaskRequest request) {
        TaskResponse response = taskService.createTask(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Task created", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get task by ID")
    public ResponseEntity<ApiResponse<TaskResponse>> getTask(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(taskService.getTaskById(id)));
    }

    @GetMapping("/my-tasks")
    @Operation(summary = "Get tasks assigned to me")
    public ResponseEntity<ApiResponse<PagedResponse<TaskResponse>>> getMyTasks(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(taskService.getTasksByAssignee(user.getId(), page, size)));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get tasks by status")
    public ResponseEntity<ApiResponse<PagedResponse<TaskResponse>>> getTasksByStatus(
            @PathVariable TaskStatus status,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(taskService.getTasksByStatus(status, page, size)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a task")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable Long id, @RequestBody TaskUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Task updated", taskService.updateTask(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Delete a task")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(ApiResponse.success("Task deleted", null));
    }
}
