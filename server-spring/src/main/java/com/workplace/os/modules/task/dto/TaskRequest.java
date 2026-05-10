package com.workplace.os.modules.task.dto;

import com.workplace.os.modules.task.entity.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskRequest {

    @NotBlank(message = "Task title is required")
    private String title;

    private String description;

    @NotNull(message = "Assignee ID is required")
    private Long assigneeId;

    private TaskPriority priority;
    private LocalDate deadline;
}
