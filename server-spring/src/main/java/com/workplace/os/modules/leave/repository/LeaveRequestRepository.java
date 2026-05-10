package com.workplace.os.modules.leave.repository;

import com.workplace.os.modules.leave.entity.LeaveRequest;
import com.workplace.os.modules.leave.entity.LeaveStatus;
import com.workplace.os.modules.leave.entity.LeaveType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    Page<LeaveRequest> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId, Pageable pageable);

    Page<LeaveRequest> findByStatusOrderByCreatedAtDesc(LeaveStatus status, Pageable pageable);

    List<LeaveRequest> findByEmployeeIdAndStatus(Long employeeId, LeaveStatus status);

    /**
     * Count total approved leave days for a given employee and leave type (current year).
     * Used to calculate remaining leave balance.
     */
    @Query("SELECT COALESCE(SUM(FUNCTION('DATEDIFF', DAY, lr.startDate, lr.endDate) + 1), 0) " +
            "FROM LeaveRequest lr WHERE lr.employee.id = :employeeId " +
            "AND lr.leaveType = :leaveType AND lr.status = 'APPROVED' " +
            "AND YEAR(lr.startDate) = :year")
    long countApprovedLeaveDays(@Param("employeeId") Long employeeId,
                                @Param("leaveType") LeaveType leaveType,
                                @Param("year") int year);

    long countByStatus(LeaveStatus status);
}
