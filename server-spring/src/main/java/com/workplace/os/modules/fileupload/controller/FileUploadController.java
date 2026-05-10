package com.workplace.os.modules.fileupload.controller;

import com.workplace.os.common.dto.ApiResponse;
import com.workplace.os.modules.fileupload.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@Tag(name = "File Upload", description = "Upload and download files")
public class FileUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    @Operation(summary = "Upload a file")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFile(@RequestParam("file") MultipartFile file) {
        String fileName = fileStorageService.storeFile(file);
        return ResponseEntity.ok(ApiResponse.success("File uploaded",
                Map.of("fileName", fileName, "url", "/api/v1/files/" + fileName)));
    }

    @GetMapping("/{fileName}")
    @Operation(summary = "Download a file")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) throws MalformedURLException {
        Path filePath = fileStorageService.loadFile(fileName);
        Resource resource = new UrlResource(filePath.toUri());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
