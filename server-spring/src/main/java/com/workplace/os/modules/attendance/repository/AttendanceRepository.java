package com.workplace.os.modules.attendance.repository;

import com.workplace.os.modules.attendance.entity.Attendance;
import com.workplace.os.modules.attendance.entity.AttendanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByEmployeeIdAndDate(Long employeeId, LocalDate date);

    Page<Attendance> findByEmployeeIdOrderByDateDesc(Long employeeId, Pageable pageable);

    List<Attendance> findByEmployeeIdAndDateBetween(Long employeeId, LocalDate startDate, LocalDate endDate);

    long countByDateAndStatus(LocalDate date, AttendanceStatus status);

    long countByDate(LocalDate date);

    /**
     * Monthly summary: count of attendance records grouped by status for a given employee/month.
     */
    @Query("SELECT a.status, COUNT(a) FROM Attendance a " +
            "WHERE a.employee.id = :employeeId " +
            "AND a.date BETWEEN :startDate AND :endDate " +
            "GROUP BY a.status")
    List<Object[]> getMonthlySummary(@Param("employeeId") Long employeeId,
                                     @Param("startDate") LocalDate startDate,
                                     @Param("endDate") LocalDate endDate);
}
