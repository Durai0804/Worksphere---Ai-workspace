package com.workplace.os.config;

import com.workplace.os.common.dto.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Health check endpoint — unprotected, used by Docker, load balancers, and monitoring.
 */
@RestController
@RequestMapping("/api/v1")
public class HealthController {

    @GetMapping("/health")
    public ApiResponse<Map<String, Object>> health() {
        return ApiResponse.success(Map.of(
                "status", "UP",
                "application", "Smart Workplace OS",
                "version", "1.0.0",
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}
