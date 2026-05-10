package com.workplace.os.modules.task.entity;

import com.workplace.os.common.entity.BaseEntity;
import com.workplace.os.modules.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Task entity — supports assigning work to employees with deadlines and priorities.
 *
 * Relationships:
 * - assignee: The employee doing the work
 * - assignedBy: The manager/admin who created the task
 */
@Entity
@Table(name = "tasks", indexes = {
        @Index(name = "idx_task_assignee", columnList = "assignee_id"),
        @Index(name = "idx_task_status", columnList = "status"),
        @Index(name = "idx_task_deadline", columnList = "deadline")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id", nullable = false)
    private Employee assignee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_id", nullable = false)
    private Employee assignedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TaskStatus status = TaskStatus.TODO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TaskPriority priority = TaskPriority.MEDIUM;

    private LocalDate deadline;
}
