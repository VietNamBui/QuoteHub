package com.social_media.myproject.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.social_media.myproject.model.TwoFactorCode;
import com.social_media.myproject.model.User;

public interface TwoFactorCodeRepository extends JpaRepository<TwoFactorCode, Long> {

    Optional<TwoFactorCode> findFirstByUserAndCodeAndUsedFalseAndExpiresAtAfter(User user, String code, LocalDateTime now);
}
