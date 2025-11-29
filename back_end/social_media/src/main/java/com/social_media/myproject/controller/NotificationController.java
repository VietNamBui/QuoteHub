package com.social_media.myproject.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.social_media.myproject.dto.NotificationDto;
import com.social_media.myproject.dto.mapper.NotificationDtoMapper;
import com.social_media.myproject.exception.UserException;
import com.social_media.myproject.model.Notification;
import com.social_media.myproject.model.User;
import com.social_media.myproject.service.NotificationService;
import com.social_media.myproject.service.UserService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<List<NotificationDto>> getMyNotifications(
            @RequestHeader("Authorization") String jwt) throws UserException {
        User current = userService.findUserProfileByJwt(jwt);
        List<Notification> list = notificationService.getMyNotifications(current);
        List<NotificationDto> dtos = NotificationDtoMapper.toDtos(list);
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }

    @GetMapping("/{id}/read")
    public ResponseEntity<NotificationDto> markAsRead(
            @PathVariable("id") Long id,
            @RequestHeader("Authorization") String jwt) throws UserException {
        User current = userService.findUserProfileByJwt(jwt);
        Notification updated = notificationService.markAsRead(id, current);
        NotificationDto dto = NotificationDtoMapper.toDto(updated);
        return new ResponseEntity<>(dto, HttpStatus.OK);
    }
}
