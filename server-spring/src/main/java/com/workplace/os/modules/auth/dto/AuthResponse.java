package com.workplace.os.modules.auth.dto;

import com.workplace.os.modules.employee.dto.EmployeeResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response returned after successful login or token refresh.
 * Contains both tokens and the authenticated user's profile.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;
    private String refreshToken;

    @Builder.Default
    private String tokenType = "Bearer";

    private EmployeeResponse user;
}
