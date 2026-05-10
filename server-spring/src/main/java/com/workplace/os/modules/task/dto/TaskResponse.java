package com.workplace.os.modules.task.dto;

import com.workplace.os.modules.task.entity.TaskPriority;
import com.workplace.os.modules.task.entity.TaskStatus;
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
public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private Long assigneeId;
    private String assigneeName;
    private Long assignedById;
    private String assignedByName;
    private TaskStatus status;
    private TaskPriority priority;
    private LocalDate deadline;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
