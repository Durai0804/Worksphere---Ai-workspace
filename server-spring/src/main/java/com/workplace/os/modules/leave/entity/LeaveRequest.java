package com.workplace.os.modules.leave.entity;

import com.workplace.os.common.entity.BaseEntity;
import com.workplace.os.modules.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Leave request entity.
 *
 * Relationship: Many leave requests belong to one employee.
 * The approvedBy field references the admin/HR who approved or rejected the request.
 */
@Entity
@Table(name = "leave_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveType leaveType;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private LeaveStatus status = LeaveStatus.PENDING;

    /** ID of the admin/HR who approved/rejected this leave */
    private Long approvedBy;

    private String rejectionReason;
}
