package com.social_media.myproject.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.social_media.myproject.model.Report;
import com.social_media.myproject.model.Twit;

public interface ReportRepository extends JpaRepository<Report, Long> {

    long countByTwitAndStatus(Twit twit, String status);

    List<Report> findByTwitAndStatus(Twit twit, String status);

    List<Report> findByStatus(String status);
}
