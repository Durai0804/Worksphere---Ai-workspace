package com.workplace.os.modules.task.repository;

import com.workplace.os.modules.task.entity.Task;
import com.workplace.os.modules.task.entity.TaskPriority;
import com.workplace.os.modules.task.entity.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    Page<Task> findByAssigneeIdOrderByDeadlineAsc(Long assigneeId, Pageable pageable);

    Page<Task> findByAssignedByIdOrderByCreatedAtDesc(Long assignedById, Pageable pageable);

    Page<Task> findByStatusOrderByDeadlineAsc(TaskStatus status, Pageable pageable);

    List<Task> findByAssigneeIdAndStatus(Long assigneeId, TaskStatus status);

    List<Task> findByDeadlineBeforeAndStatusNot(LocalDate date, TaskStatus status);

    long countByAssigneeIdAndStatus(Long assigneeId, TaskStatus status);

    long countByStatus(TaskStatus status);

    long countByPriority(TaskPriority priority);
}
