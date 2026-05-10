package com.workplace.os.modules.leave.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalanceResponse {

    /** Map of LeaveType name -> { total, used, remaining } */
    private Map<String, LeaveQuota> balances;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeaveQuota {
        private int total;
        private long used;
        private long remaining;
    }
}
