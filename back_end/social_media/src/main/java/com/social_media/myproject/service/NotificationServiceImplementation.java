package com.social_media.myproject.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.social_media.myproject.model.Notification;
import com.social_media.myproject.model.Twit;
import com.social_media.myproject.model.User;
import com.social_media.myproject.repository.NotificationRepository;

@Service
public class NotificationServiceImplementation implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

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
        return notificationRepository.save(n);
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
