package com.workplace.os;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Main entry point for Smart Workplace OS.
 * @EnableAsync allows us to run email/notification tasks in background threads.
 */
@SpringBootApplication
@EnableAsync
public class WorkplaceOsApplication {

    public static void main(String[] args) {
        SpringApplication.run(WorkplaceOsApplication.class, args);
    }
}
