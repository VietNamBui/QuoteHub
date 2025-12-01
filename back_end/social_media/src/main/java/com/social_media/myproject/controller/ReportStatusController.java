package com.social_media.myproject.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.social_media.myproject.dto.TwitDto;
import com.social_media.myproject.dto.mapper.TwitDtoMapper;
import com.social_media.myproject.exception.UserException;
import com.social_media.myproject.model.Report;
import com.social_media.myproject.model.Twit;
import com.social_media.myproject.model.User;
import com.social_media.myproject.repository.ReportRepository;
import com.social_media.myproject.service.UserService;

@RestController
@RequestMapping("/api/reports")
public class ReportStatusController {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserService userService;

    // Lấy danh sách Twit theo trạng thái xử lý report (APPROVED, REJECTED, ...)
    @GetMapping("/by-status")
    public ResponseEntity<List<TwitDto>> getReportedTwitsByStatus(
            @RequestHeader("Authorization") String jwt,
            @RequestParam("status") String status) throws UserException {
        User user = userService.findUserProfileByJwt(jwt);
        if (!user.isAdmin()) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        List<Report> reports = reportRepository.findByStatus(status);
        java.util.Set<Long> seen = new java.util.HashSet<>();
        List<TwitDto> dtos = new ArrayList<>();
        for (Report r : reports) {
            Twit t = r.getTwit();
            if (t != null && t.getId() != null && !seen.contains(t.getId())) {
                seen.add(t.getId());
                TwitDto dto = TwitDtoMapper.toTwitDto(t, null);
                if (dto != null) dtos.add(dto);
            }
        }
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }
}
