package com.workplace.os.modules.auth.repository;

import com.workplace.os.modules.auth.entity.RefreshToken;
import com.workplace.os.modules.employee.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    @Modifying
    void deleteByEmployee(Employee employee);
}
