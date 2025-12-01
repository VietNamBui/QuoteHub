package com.social_media.myproject.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.social_media.myproject.model.Report;
import com.social_media.myproject.model.Twit;
import com.social_media.myproject.model.User;
import com.social_media.myproject.repository.ReportRepository;

@Service
public class ReportServiceImplementation implements ReportService {

    private static final String STATUS_PENDING = "PENDING";

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Override
    public Report createReport(User reporter, Twit twit, String reason) {
        Report r = new Report();
        r.setUser(reporter);
        r.setTwit(twit);
        r.setReason(reason);
        r.setStatus(STATUS_PENDING);
        r.setCreatedAt(LocalDateTime.now());
        Report saved = reportRepository.save(r);
        if (messagingTemplate != null) {
            messagingTemplate.convertAndSend("/topic/admin/analytics", "ANALYTICS_UPDATED");
            messagingTemplate.convertAndSend("/topic/admin/moderation", "MODERATION_UPDATED");
        }
        return saved;
    }

    @Override
    public List<Report> findPendingReports() {
        return reportRepository.findByStatusOrderByCreatedAtDesc(STATUS_PENDING);
    }
}
