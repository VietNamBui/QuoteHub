package com.social_media.myproject.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import com.social_media.myproject.dto.TwitDto;
import com.social_media.myproject.dto.mapper.TwitDtoMapper;
import com.social_media.myproject.exception.TwitException;
import com.social_media.myproject.exception.UserException;
import com.social_media.myproject.model.Twit;
import com.social_media.myproject.request.ModerationDecisionRequest;
import com.social_media.myproject.service.TwitService;
import com.social_media.myproject.service.UserService;

@RestController
@RequestMapping("/api/moderation")
public class ModerationController {

    @Autowired
    private TwitService twitService;

    @Autowired
    private UserService userService;

    @PostMapping("/twits/{id}/approve")
    public ResponseEntity<Twit> approveTwit(
            @PathVariable("id") Long id,
            @RequestHeader("Authorization") String jwt) throws UserException, TwitException {
        // Chỉ admin mới được duyệt bài
        var user = userService.findUserProfileByJwt(jwt);
        if (!user.isAdmin()) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        // Không cho phép admin tự duyệt bài của chính mình
        Twit target = twitService.findById(id);
        if (target.getUser() != null && target.getUser().getId().equals(user.getId())) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        Twit updated = twitService.approveModeration(id);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @PostMapping("/twits/{id}/reject")
    public ResponseEntity<Twit> rejectTwit(
            @PathVariable("id") Long id,
            @RequestBody ModerationDecisionRequest req,
            @RequestHeader("Authorization") String jwt) throws UserException, TwitException {
        // Chỉ admin mới được từ chối bài
        var user = userService.findUserProfileByJwt(jwt);
        if (!user.isAdmin()) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        // Không cho phép admin tự từ chối/bỏ chặn bài của chính mình
        Twit target = twitService.findById(id);
        if (target.getUser() != null && target.getUser().getId().equals(user.getId())) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        Twit updated = twitService.rejectModeration(id, req.getReason());
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    // Duyệt comment (reply) sau khi AI gắn PENDING/BLOCKED
    @PostMapping("/replies/{id}/approve")
    public ResponseEntity<Twit> approveReply(
            @PathVariable("id") Long id,
            @RequestHeader("Authorization") String jwt) throws UserException, TwitException {
        var user = userService.findUserProfileByJwt(jwt);
        if (!user.isAdmin()) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        // Không cho phép admin tự duyệt reply của chính mình
        Twit reply = twitService.findById(id);
        if (reply.getUser() != null && reply.getUser().getId().equals(user.getId())) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        Twit updated = twitService.approveReplyModeration(id);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    // Lấy danh sách tất cả twit đang ở trạng thái AI PENDING (không cần phải bị report)
    @GetMapping("/twits/pending")
    public ResponseEntity<java.util.List<TwitDto>> getPendingModerationTwits(
            @RequestHeader("Authorization") String jwt) throws UserException {
        var user = userService.findUserProfileByJwt(jwt);
        if (!user.isAdmin()) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        java.util.List<Twit> pending = twitService.findPendingModerationTwits();
        java.util.List<TwitDto> dtos = new java.util.ArrayList<>();
        for (Twit t : pending) {
            TwitDto dto = TwitDtoMapper.toTwitDto(t, null);
            if (dto != null) dtos.add(dto);
        }
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }

    // Lấy danh sách twit theo trạng thái kiểm duyệt bất kỳ (APPROVED, REJECTED, PENDING,...)
    @GetMapping("/twits")
    public ResponseEntity<java.util.List<TwitDto>> getTwitsByStatus(
            @RequestHeader("Authorization") String jwt,
            @RequestParam("status") String status) throws UserException {
        var user = userService.findUserProfileByJwt(jwt);
        if (!user.isAdmin()) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        java.util.List<Twit> list = twitService.findTwitsByModerationStatus(status);
        java.util.List<TwitDto> dtos = new java.util.ArrayList<>();
        for (Twit t : list) {
            TwitDto dto = TwitDtoMapper.toTwitDto(t, null);
            if (dto != null) dtos.add(dto);
        }
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }
}
