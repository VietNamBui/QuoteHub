package com.social_media.myproject.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.social_media.myproject.dto.EmailImportLogDto;
import com.social_media.myproject.model.EmailImportLog;
import com.social_media.myproject.model.EmailImportToken;
import com.social_media.myproject.model.User;
import com.social_media.myproject.repository.EmailImportLogRepository;
import com.social_media.myproject.repository.EmailImportTokenRepository;
import com.social_media.myproject.service.KindleService;
import com.social_media.myproject.service.UserService;

@RestController
@RequestMapping("/api/email")
public class KindleEmailController {

    @Autowired
    private KindleService kindleService;

    @Autowired
    private EmailImportTokenRepository emailImportTokenRepository;

    @Autowired
    private EmailImportLogRepository emailImportLogRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // TODO: move this to configuration if you change domains
    private static final String MAILGUN_DOMAIN = "sandboxeaecb30960bc4619a7d37b396af6a14a.mailgun.org";

    @GetMapping("/import-address")
    public ResponseEntity<?> getImportAddress(@RequestHeader("Authorization") String jwt) {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            EmailImportToken token = emailImportTokenRepository.findByUserAndActiveTrue(user)
                    .orElseGet(() -> {
                        EmailImportToken t = new EmailImportToken();
                        t.setUser(user);
                        t.setToken(generateRandomToken());
                        return emailImportTokenRepository.save(t);
                    });
            String email = "kindle+" + token.getToken() + "@" + MAILGUN_DOMAIN;
            return ResponseEntity.ok(email);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generating import address");
        }
    }

    private String generateRandomToken() {
        // Simple random token using UUID without dashes, truncated
        return java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 24);
    }

    @PostMapping("/import-highlights")
    public ResponseEntity<?> handleInboundEmail(
            @RequestParam(value = "recipient", required = false) String recipient,
            @RequestParam(value = "to", required = false) String to,
            @RequestParam(value = "from", required = false) String from,
            @RequestParam(value = "subject", required = false) String subject,
            @RequestParam(value = "attachment-1", required = false) MultipartFile attachment1,
            @RequestParam(value = "attachment1", required = false) MultipartFile attachmentAlt
    ) {
        try {
            MultipartFile file = attachment1 != null ? attachment1 : attachmentAlt;
            if (file == null || file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing attachment");
            }

            String address = recipient != null ? recipient : to;
            if (address == null || !address.contains("+")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid recipient");
            }

            String localPart = address.split("@")[0];
            int plusIndex = localPart.indexOf('+');
            if (plusIndex < 0 || plusIndex == localPart.length() - 1) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid recipient format");
            }

            String tokenValue = localPart.substring(plusIndex + 1);
            EmailImportToken token = emailImportTokenRepository.findByTokenAndActiveTrue(tokenValue)
                    .orElse(null);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid token");
            }

            User user = token.getUser();
            if (user == null || user.getEmail() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User not found for token");
            }

            // Validate sender email matches user's registered email if 'from' is provided
            if (from != null && !from.isBlank()) {
                String senderEmail = extractEmailAddress(from);
                if (senderEmail == null || !senderEmail.equalsIgnoreCase(user.getEmail())) {
                    // Log rejected email
                    EmailImportLog log = new EmailImportLog();
                    log.setUser(user);
                    log.setSenderEmail(senderEmail);
                    log.setRecipient(address);
                    log.setSubject(subject);
                    log.setFileName(file.getOriginalFilename());
                    emailImportLogRepository.save(log);
                    // Do not treat as error to avoid Mailgun retries, just ignore silently
                    return ResponseEntity.ok("Sender not allowed for this token");
                }
            }

            // Log accepted email
            EmailImportLog log = new EmailImportLog();
            log.setUser(user);
            log.setSenderEmail(user.getEmail());
            log.setRecipient(address);
            log.setSubject(subject);
            log.setFileName(file.getOriginalFilename());
            EmailImportLog saved = emailImportLogRepository.save(log);

            kindleService.processHtmlFile(file, user.getId());

            // publish DTO over WebSocket for this user
            EmailImportLogDto dto = new EmailImportLogDto(
                    saved.getId(),
                    saved.getSenderEmail(),
                    saved.getRecipient(),
                    saved.getSubject(),
                    saved.getFileName(),
                    saved.getReceivedAt()
            );
            messagingTemplate.convertAndSend("/topic/email/import-history/" + user.getId(), dto);

            return ResponseEntity.ok("Imported successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing email");
        }
    }

    @GetMapping("/import-history")
    public ResponseEntity<?> getImportHistory(@RequestHeader("Authorization") String jwt) {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            return ResponseEntity.ok(
                    emailImportLogRepository.findByUserOrderByReceivedAtDesc(user)
                            .stream()
                            .map(log -> new EmailImportLogDto(
                                    log.getId(),
                                    log.getSenderEmail(),
                                    log.getRecipient(),
                                    log.getSubject(),
                                    log.getFileName(),
                                    log.getReceivedAt()
                            ))
                            .toList()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching import history");
        }
    }

    private String extractEmailAddress(String fromHeader) {
        if (fromHeader == null) {
            return null;
        }
        String trimmed = fromHeader.trim();
        int lt = trimmed.indexOf('<');
        int gt = trimmed.indexOf('>');
        if (lt >= 0 && gt > lt) {
            return trimmed.substring(lt + 1, gt).trim();
        }
        return trimmed;
    }
}
