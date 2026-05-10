package com.workplace.os.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Enables JPA Auditing so that @CreatedDate and @LastModifiedDate
 * annotations in BaseEntity are automatically populated by Spring.
 */
@Configuration
@EnableJpaAuditing
public class AuditingConfig {
}
