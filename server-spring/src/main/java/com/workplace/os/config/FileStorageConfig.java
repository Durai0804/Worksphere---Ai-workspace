package com.workplace.os.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Creates the file upload directory on application startup if it doesn't exist.
 */
@Configuration
public class FileStorageConfig {

    @Value("${app.file.upload-dir}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create upload directory: " + uploadDir, ex);
        }
    }

    public String getUploadDir() {
        return uploadDir;
    }
}
