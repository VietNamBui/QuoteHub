package com.social_media.myproject.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.social_media.myproject.model.EmailImportToken;
import com.social_media.myproject.model.User;

public interface EmailImportTokenRepository extends JpaRepository<EmailImportToken, Long> {

    Optional<EmailImportToken> findByTokenAndActiveTrue(String token);

    Optional<EmailImportToken> findByUserAndActiveTrue(User user);
}
