package com.social_media.myproject.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.social_media.myproject.dto.ManualImportLogDto;
import com.social_media.myproject.exception.UserException;
import com.social_media.myproject.model.ManualImportLog;
import com.social_media.myproject.model.User;
import com.social_media.myproject.repository.ManualImportLogRepository;
import com.social_media.myproject.service.KindleService;
import com.social_media.myproject.service.UserService;

@RestController
@RequestMapping("/api")
public class KindleController {

    @Autowired
    private KindleService kindleService;

    @Autowired
    private ManualImportLogRepository manualImportLogRepository;

    @Autowired
    private UserService userService;

    @PostMapping("/upload-kindle")
    public ResponseEntity<?> uploadKindle(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId
    ) {
        kindleService.processHtmlFile(file, userId);

        // Lưu lịch sử import thủ công
        User user = new User();
        user.setId(userId);
        ManualImportLog log = new ManualImportLog();
        log.setUser(user);
        log.setFileName(file.getOriginalFilename());
        manualImportLogRepository.save(log);

        return ResponseEntity.ok("Uploaded successfully");
    }

    @GetMapping("/kindle/import-history")
    public ResponseEntity<?> getManualImportHistory(@RequestHeader("Authorization") String jwt) {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            List<ManualImportLog> logs = manualImportLogRepository.findByUserOrderByImportedAtDesc(user);
            List<ManualImportLogDto> dtos = logs.stream()
                    .map(log -> new ManualImportLogDto(
                            log.getId(),
                            log.getFileName(),
                            log.getImportedAt()
                    ))
                    .toList();
            return ResponseEntity.ok(dtos);
        } catch (UserException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid user");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching import history");
        }
    }

    @DeleteMapping("/kindle/import-history")
    public ResponseEntity<?> clearManualImportHistory(@RequestHeader("Authorization") String jwt) {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            // Delete all manual import logs for this user
            List<ManualImportLog> logs = manualImportLogRepository.findByUserOrderByImportedAtDesc(user);
            if (!logs.isEmpty()) {
                manualImportLogRepository.deleteAll(logs);
            }
            return ResponseEntity.ok().build();
        } catch (UserException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid user");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error clearing import history");
        }
    }

}
