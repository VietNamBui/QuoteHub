package com.social_media.myproject.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public enum Type {
        LIKE,
        REPLY,
        FOLLOW
    }

    @Enumerated(EnumType.STRING)
    private Type type;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;

    @ManyToOne
    @JoinColumn(name = "recipient_id")
    private User recipient;

    @ManyToOne
    @JoinColumn(name = "twit_id")
    private Twit twit; // chỉ dùng cho LIKE, REPLY

    private LocalDateTime createdAt;

    private boolean readFlag = false;
}
