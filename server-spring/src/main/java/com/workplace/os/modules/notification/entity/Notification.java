package com.workplace.os.modules.notification.entity;

import com.workplace.os.common.entity.BaseEntity;
import com.workplace.os.modules.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;

/**
 * In-app notification entity.
 *
 * Types: LEAVE_APPROVED, TASK_ASSIGNED, ATTENDANCE_REMINDER, SYSTEM, etc.
 * Tracks read/unread status for badge counts on the frontend.
 */
@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notification_recipient", columnList = "recipient_id"),
        @Index(name = "idx_notification_read", columnList = "is_read")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private Employee recipient;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private String type; // e.g., "LEAVE_APPROVED", "TASK_ASSIGNED", "SYSTEM"

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean read = false;

    /** Optional link to navigate to when notification is clicked */
    private String actionUrl;
}
