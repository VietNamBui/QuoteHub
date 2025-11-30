package com.social_media.myproject.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.social_media.myproject.dto.NotificationDto;
import com.social_media.myproject.dto.mapper.NotificationDtoMapper;
import com.social_media.myproject.model.Notification;
import com.social_media.myproject.model.Twit;
import com.social_media.myproject.model.User;
import com.social_media.myproject.repository.NotificationRepository;

@Service
public class NotificationServiceImplementation implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Override
    public List<Notification> getMyNotifications(User currentUser) {
        if (currentUser == null) return List.of();
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(currentUser);
    }

    private Notification buildAndSave(Notification.Type type, User sender, User recipient, Twit twit) {
        if (sender == null || recipient == null) return null;
        if (sender.getId() != null && sender.getId().equals(recipient.getId())) {
            // Không tạo notification cho chính mình
            return null;
        }
        Notification n = new Notification();
        n.setType(type);
        n.setSender(sender);
        n.setRecipient(recipient);
        n.setTwit(twit);
        n.setCreatedAt(LocalDateTime.now());
        n.setReadFlag(false);
        Notification saved = notificationRepository.save(n);
        // Gửi realtime qua WebSocket cho người nhận (dạng DTO giống API REST)
        if (saved.getRecipient() != null && saved.getRecipient().getId() != null) {
            String destination = "/topic/notifications/" + saved.getRecipient().getId();
            NotificationDto dto = NotificationDtoMapper.toDto(saved);
            messagingTemplate.convertAndSend(destination, dto);
        }
        return saved;
    }

    @Override
    public Notification createLikeNotification(User sender, User recipient, Twit twit) {
        return buildAndSave(Notification.Type.LIKE, sender, recipient, twit);
    }

    @Override
    public Notification createReplyNotification(User sender, User recipient, Twit twit) {
        return buildAndSave(Notification.Type.REPLY, sender, recipient, twit);
    }

    @Override
    public Notification createFollowNotification(User sender, User recipient) {
        return buildAndSave(Notification.Type.FOLLOW, sender, recipient, null);
    }

    @Override
    public void createNewTwitNotificationForFollowers(User author, Twit twit) {
        if (author == null || author.getFollowers() == null || author.getFollowers().isEmpty()) return;
        for (User follower : author.getFollowers()) {
            buildAndSave(Notification.Type.NEW_TWIT, author, follower, twit);
        }
    }

    @Override
    public Notification markAsRead(Long notificationId, User currentUser) {
        if (currentUser == null) return null;
        return notificationRepository.findById(notificationId)
                .map(n -> {
                    if (n.getRecipient() != null &&
                        n.getRecipient().getId() != null &&
                        n.getRecipient().getId().equals(currentUser.getId())) {
                        n.setReadFlag(true);
                        return notificationRepository.save(n);
                    }
                    return n;
                })
                .orElse(null);
    }
}
