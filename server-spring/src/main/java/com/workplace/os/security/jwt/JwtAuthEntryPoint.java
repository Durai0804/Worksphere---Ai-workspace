package com.workplace.os.security.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workplace.os.common.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Handles unauthorized access attempts (missing or invalid JWT).
 *
 * WHY: By default, Spring Security returns an HTML error page for 401s.
 * This entry point overrides that behavior to return a clean JSON response
 * that the React frontend can parse.
 */
@Slf4j
@Component
public class JwtAuthEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        log.error("Unauthorized error: {}", authException.getMessage());

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        ApiResponse<Void> body = ApiResponse.error("Unauthorized — please login to access this resource");

        final ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules(); // Register JavaTimeModule for LocalDateTime
        mapper.writeValue(response.getOutputStream(), body);
    }
}
