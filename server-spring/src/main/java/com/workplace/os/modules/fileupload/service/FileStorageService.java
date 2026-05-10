package com.workplace.os.modules.fileupload.service;

import com.workplace.os.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${app.file.upload-dir}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public String storeFile(MultipartFile file) {
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
        if (originalFilename.contains("..")) {
            throw new BadRequestException("Filename contains invalid path sequence: " + originalFilename);
        }
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) extension = originalFilename.substring(dotIndex);
        String storedFilename = UUID.randomUUID() + extension;

        try {
            Path targetLocation = this.fileStorageLocation.resolve(storedFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            log.info("Stored file: {} as {}", originalFilename, storedFilename);
            return storedFilename;
        } catch (IOException ex) {
            throw new BadRequestException("Could not store file " + originalFilename + ". Please try again.");
        }
    }

    public Path loadFile(String fileName) {
        return fileStorageLocation.resolve(fileName).normalize();
    }
}
