package com.social_media.myproject.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.social_media.myproject.model.EmailImportLog;
import com.social_media.myproject.model.User;

public interface EmailImportLogRepository extends JpaRepository<EmailImportLog, Long> {

    List<EmailImportLog> findByUserOrderByReceivedAtDesc(User user);
    List<EmailImportLog> findByUserOrderByReceivedAtAsc(User user);
}
