package com.social_media.myproject.service;

import java.util.List;

import com.social_media.myproject.model.Notification;
import com.social_media.myproject.model.Twit;
import com.social_media.myproject.model.User;

public interface NotificationService {

    List<Notification> getMyNotifications(User currentUser);

    Notification createLikeNotification(User sender, User recipient, Twit twit);

    Notification createReplyNotification(User sender, User recipient, Twit twit);

    Notification createFollowNotification(User sender, User recipient);

    void createNewTwitNotificationForFollowers(User author, Twit twit);

    Notification markAsRead(Long notificationId, User currentUser);
}
