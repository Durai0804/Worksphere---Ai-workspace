package com.workplace.os.modules.notification.service;

import com.workplace.os.common.dto.PagedResponse;
import com.workplace.os.modules.employee.entity.Employee;
import com.workplace.os.modules.employee.entity.Role;
import com.workplace.os.modules.employee.repository.EmployeeRepository;
import com.workplace.os.modules.notification.dto.NotificationResponse;
import com.workplace.os.modules.notification.entity.Notification;
import com.workplace.os.modules.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmployeeRepository employeeRepository;

    /**
     * Create a notification for a specific employee.
     * If recipientId is null, sends to all ADMIN and HR users.
     */
    @Transactional
    public void createNotification(Long recipientId, String title, String message, String type) {
        if (recipientId != null) {
            Employee recipient = employeeRepository.findById(recipientId).orElse(null);
            if (recipient != null) {
                saveNotification(recipient, title, message, type);
            }
        } else {
            // Broadcast to all admins and HR
            List<Employee> managers = employeeRepository.findAll().stream()
                    .filter(e -> e.getRole() == Role.ADMIN || e.getRole() == Role.HR).toList();
            for (Employee mgr : managers) {
                saveNotification(mgr, title, message, type);
            }
        }
    }

    @Transactional(readOnly = true)
    public PagedResponse<NotificationResponse> getNotifications(Long recipientId, int page, int size) {
        Page<Notification> p = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId, PageRequest.of(page, size));
        return PagedResponse.<NotificationResponse>builder()
                .content(p.getContent().stream().map(this::mapToResponse).toList())
                .page(p.getNumber()).size(p.getSize()).totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages()).last(p.isLast()).build();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long recipientId) {
        return notificationRepository.countByRecipientIdAndReadFalse(recipientId);
    }

    @Transactional
    public void markAllAsRead(Long recipientId) {
        notificationRepository.markAllAsRead(recipientId);
    }

    private void saveNotification(Employee recipient, String title, String message, String type) {
        Notification n = Notification.builder().recipient(recipient).title(title).message(message).type(type).read(false).build();
        notificationRepository.save(n);
        log.debug("Notification created for {}: {}", recipient.getFullName(), title);
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder().id(n.getId()).title(n.getTitle()).message(n.getMessage())
                .type(n.getType()).read(n.isRead()).actionUrl(n.getActionUrl()).createdAt(n.getCreatedAt()).build();
    }
}
