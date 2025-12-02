package com.social_media.myproject.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Data;

@Data
@Entity
public class Twit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String content;
    private String image;

    @ManyToOne
    @JoinColumn(name = "reply_for_id")
    private Twit replyFor;

    @OneToMany(mappedBy = "replyFor", cascade = CascadeType.ALL)
    private List<Twit> replyTwits = new ArrayList<>();

    private Boolean isReply;
    private Boolean isTwit;
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "quote_id")
    private Quote quote;

    // Snapshot nội dung quote tại thời điểm đăng twit
    @Column(columnDefinition = "LONGTEXT")
    private String quoteSnapshot;

    @OneToMany(mappedBy = "twit", cascade = CascadeType.ALL)
    private List<Like> likes = new ArrayList<>();

    @OneToMany(mappedBy = "twit", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TwitRetwitUser> retwits = new ArrayList<>();

    // Trạng thái kiểm duyệt nội dung: APPROVED, PENDING, BLOCKED, REJECTED
    private String moderationStatus;
    // Lý do bị gắn cờ (từ AI hoặc từ moderator)
    private String moderationReason;
    // Điểm rủi ro do AI đánh giá (0-1)
    private Double aiRiskScore;
    // Các nhãn vi phạm do AI trả về, ví dụ: "HATE, SEXUAL"
    private String aiCategories;
}
