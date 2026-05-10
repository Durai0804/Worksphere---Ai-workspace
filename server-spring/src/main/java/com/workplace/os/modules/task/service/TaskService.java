package com.workplace.os.modules.task.service;

import com.workplace.os.common.dto.PagedResponse;
import com.workplace.os.exception.ResourceNotFoundException;
import com.workplace.os.modules.employee.entity.Employee;
import com.workplace.os.modules.employee.repository.EmployeeRepository;
import com.workplace.os.modules.notification.service.NotificationService;
import com.workplace.os.modules.task.dto.*;
import com.workplace.os.modules.task.entity.Task;
import com.workplace.os.modules.task.entity.TaskPriority;
import com.workplace.os.modules.task.entity.TaskStatus;
import com.workplace.os.modules.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

    @Transactional
    public TaskResponse createTask(Long assignedById, TaskRequest request) {
        Employee assignee = findEmployee(request.getAssigneeId());
        Employee assignedBy = findEmployee(assignedById);
        Task task = Task.builder().title(request.getTitle()).description(request.getDescription())
                .assignee(assignee).assignedBy(assignedBy)
                .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM)
                .status(TaskStatus.TODO).deadline(request.getDeadline()).build();
        task = taskRepository.save(task);
        notificationService.createNotification(assignee.getId(), "New Task Assigned",
                "You have been assigned: " + task.getTitle(), "TASK_ASSIGNED");
        return mapToResponse(task);
    }

    @Transactional
    public TaskResponse updateTask(Long taskId, TaskUpdateRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getDeadline() != null) task.setDeadline(request.getDeadline());
        if (request.getAssigneeId() != null) {
            Employee newAssignee = findEmployee(request.getAssigneeId());
            task.setAssignee(newAssignee);
        }
        task = taskRepository.save(task);
        return mapToResponse(task);
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        return mapToResponse(task);
    }

    @Transactional(readOnly = true)
    public PagedResponse<TaskResponse> getTasksByAssignee(Long assigneeId, int page, int size) {
        Page<Task> p = taskRepository.findByAssigneeIdOrderByDeadlineAsc(assigneeId, PageRequest.of(page, size));
        return buildPagedResponse(p);
    }

    @Transactional(readOnly = true)
    public PagedResponse<TaskResponse> getTasksByStatus(TaskStatus status, int page, int size) {
        Page<Task> p = taskRepository.findByStatusOrderByDeadlineAsc(status, PageRequest.of(page, size));
        return buildPagedResponse(p);
    }

    @Transactional
    public void deleteTask(Long taskId) {
        if (!taskRepository.existsById(taskId)) throw new ResourceNotFoundException("Task", "id", taskId);
        taskRepository.deleteById(taskId);
    }

    private Employee findEmployee(Long id) {
        return employeeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
    }

    private TaskResponse mapToResponse(Task t) {
        return TaskResponse.builder().id(t.getId()).title(t.getTitle()).description(t.getDescription())
                .assigneeId(t.getAssignee().getId()).assigneeName(t.getAssignee().getFullName())
                .assignedById(t.getAssignedBy().getId()).assignedByName(t.getAssignedBy().getFullName())
                .status(t.getStatus()).priority(t.getPriority()).deadline(t.getDeadline())
                .createdAt(t.getCreatedAt()).updatedAt(t.getUpdatedAt()).build();
    }

    private PagedResponse<TaskResponse> buildPagedResponse(Page<Task> p) {
        return PagedResponse.<TaskResponse>builder()
                .content(p.getContent().stream().map(this::mapToResponse).toList())
                .page(p.getNumber()).size(p.getSize()).totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages()).last(p.isLast()).build();
    }
}
