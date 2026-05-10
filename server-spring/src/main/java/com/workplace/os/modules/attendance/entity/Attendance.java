package com.workplace.os.modules.attendance.entity;

import com.workplace.os.common.entity.BaseEntity;
import com.workplace.os.modules.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Attendance entity — tracks daily check-in / check-out for each employee.
 *
 * Relationship: Many attendance records belong to one employee.
 * Unique constraint: An employee can only have one attendance record per date.
 */
@Entity
@Table(name = "attendance", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"employee_id", "date"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate date;

    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;

    /** Total hours worked — calculated on check-out */
    @Column(columnDefinition = "DECIMAL(5,2)")
    private Double hoursWorked;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AttendanceStatus status = AttendanceStatus.PRESENT;

    private String notes;
}
