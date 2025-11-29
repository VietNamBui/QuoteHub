package com.social_media.myproject.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.social_media.myproject.model.PasswordResetToken;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);
}
