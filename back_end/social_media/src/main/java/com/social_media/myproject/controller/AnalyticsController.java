package com.social_media.myproject.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.social_media.myproject.exception.UserException;
import com.social_media.myproject.model.User;
import com.social_media.myproject.repository.ReportRepository;
import com.social_media.myproject.repository.TwitRepository;
import com.social_media.myproject.repository.UserRepository;
import com.social_media.myproject.service.UserService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/analytics")
public class AnalyticsController {

    @Autowired
    private UserService userService;

    @Autowired
    private TwitRepository twitRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getOverview(@RequestHeader("Authorization") String jwt) throws UserException {
        User user = userService.findUserProfileByJwt(jwt);
        if (!user.isAdmin()) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        Map<String, Object> data = new HashMap<>();

        long totalUsers = userRepository.count();
        long totalTwits = twitRepository.count();

        long approvedTwits = twitRepository.countByModerationStatus("APPROVED");
        long pendingTwits = twitRepository.countByModerationStatus("PENDING");
        long rejectedTwits = twitRepository.countByModerationStatus("REJECTED");
        long blockedTwits = twitRepository.countByModerationStatus("BLOCKED");

        long reportedPendingTwits = reportRepository.findByStatus("PENDING").stream()
                .filter(r -> r.getTwit() != null && r.getTwit().getId() != null)
                .map(r -> r.getTwit().getId())
                .distinct()
                .count();
        long totalReports = reportRepository.count();
        long pendingReports = reportRepository.countByStatus("PENDING");
        long resolvedReports = totalReports - pendingReports;

        Map<String, Object> moderationStats = new HashMap<>();
        moderationStats.put("totalTwits", totalTwits);
        moderationStats.put("approved", approvedTwits);
        moderationStats.put("pending", pendingTwits);
        moderationStats.put("rejected", rejectedTwits);
        moderationStats.put("blocked", blockedTwits);
        moderationStats.put("reportedPending", reportedPendingTwits);

        Map<String, Object> reportStats = new HashMap<>();
        reportStats.put("totalReports", totalReports);
        reportStats.put("pendingReports", pendingReports);
        reportStats.put("resolvedReports", resolvedReports);

        data.put("totalUsers", totalUsers);
        data.put("moderation", moderationStats);
        data.put("reports", reportStats);

        return new ResponseEntity<>(data, HttpStatus.OK);
    }
}
