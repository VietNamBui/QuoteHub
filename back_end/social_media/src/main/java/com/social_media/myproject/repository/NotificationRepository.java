package com.social_media.myproject.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.social_media.myproject.model.Notification;
import com.social_media.myproject.model.User;
import com.social_media.myproject.model.Twit;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);

    void deleteByTwit(Twit twit);
}
