package com.social_media.myproject.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.social_media.myproject.dto.TwitDto;
import com.social_media.myproject.dto.mapper.TwitDtoMapper;
import com.social_media.myproject.exception.TwitException;
import com.social_media.myproject.exception.UserException;
import com.social_media.myproject.model.Report;
import com.social_media.myproject.model.Twit;
import com.social_media.myproject.model.User;
import com.social_media.myproject.request.CreateReportRequest;
import com.social_media.myproject.service.ReportService;
import com.social_media.myproject.service.TwitService;
import com.social_media.myproject.service.UserService;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private TwitService twitService;

    @Autowired
    private UserService userService;

    @PostMapping()
    public ResponseEntity<String> createReport(
            @RequestBody CreateReportRequest req,
            @RequestHeader("Authorization") String jwt) throws UserException, TwitException {
        User reporter = userService.findUserProfileByJwt(jwt);
        Twit twit = twitService.findById(req.getTwitId());
        reportService.createReport(reporter, twit, req.getReason());
        return new ResponseEntity<>("Đã gửi báo cáo", HttpStatus.OK);
    }

    // API đơn giản cho admin: lấy danh sách Twit bị report (PENDING)
    @GetMapping("/pending")
    public ResponseEntity<List<TwitDto>> getPendingReportedTwits(
            @RequestHeader("Authorization") String jwt) throws UserException {
        // Chỉ cần đảm bảo jwt hợp lệ (phân quyền admin có thể thêm sau)
        userService.findUserProfileByJwt(jwt);
        List<Report> pending = reportService.findPendingReports();
        // Lấy các Twit unique
        java.util.Set<Long> seen = new java.util.HashSet<>();
        java.util.List<Twit> twits = new java.util.ArrayList<>();
        for (Report r : pending) {
            if (r.getTwit() != null && r.getTwit().getId() != null
                    && !seen.contains(r.getTwit().getId())) {
                seen.add(r.getTwit().getId());
                twits.add(r.getTwit());
            }
        }
        // Map sang DTO, dùng user null vì ở đây là admin view, không phụ thuộc profile cụ thể
        List<TwitDto> dtos = TwitDtoMapper.toTwitDtos(twits, null);
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }
}
