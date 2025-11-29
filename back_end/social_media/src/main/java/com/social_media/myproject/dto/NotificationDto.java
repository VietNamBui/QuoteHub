package com.social_media.myproject.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class NotificationDto {

    private Long id;
    private String type;
    private LocalDateTime createdAt;

    private boolean readFlag;

    private Long senderId;
    private String senderName;
    private String senderImage;

    private Long twitId;
    private String twitContent;
}
