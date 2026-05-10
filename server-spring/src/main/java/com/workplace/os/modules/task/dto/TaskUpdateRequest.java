package com.workplace.os.modules.task.dto;

import com.workplace.os.modules.task.entity.TaskPriority;
import com.workplace.os.modules.task.entity.TaskStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskUpdateRequest {

    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private LocalDate deadline;
    private Long assigneeId;
}
