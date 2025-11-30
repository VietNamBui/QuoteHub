package com.social_media.myproject.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import lombok.Data;

@Data
@Entity
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user; // người báo cáo

    @ManyToOne
    @JoinColumn(name = "twit_id")
    private Twit twit; // bài bị báo cáo

    private String reason; // spam, scam, offensive, copyright, ...

    // PENDING, REVIEWED
    private String status;

    private LocalDateTime createdAt;
}
