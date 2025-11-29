package com.social_media.myproject.dto.mapper;

import java.util.List;
import java.util.stream.Collectors;

import com.social_media.myproject.dto.NotificationDto;
import com.social_media.myproject.model.Notification;

public class NotificationDtoMapper {

    public static NotificationDto toDto(Notification n) {
        if (n == null) return null;
        NotificationDto dto = new NotificationDto();
        dto.setId(n.getId());
        dto.setType(n.getType() != null ? n.getType().name() : null);
        dto.setCreatedAt(n.getCreatedAt());
        dto.setReadFlag(n.isReadFlag());

        if (n.getSender() != null) {
            dto.setSenderId(n.getSender().getId());
            dto.setSenderName(n.getSender().getFullName());
            dto.setSenderImage(n.getSender().getImage());
        }

        if (n.getTwit() != null) {
            dto.setTwitId(n.getTwit().getId());
            dto.setTwitContent(n.getTwit().getContent());
        }

        return dto;
    }

    public static List<NotificationDto> toDtos(List<Notification> list) {
        if (list == null) return List.of();
        return list.stream().map(NotificationDtoMapper::toDto).collect(Collectors.toList());
    }
}
