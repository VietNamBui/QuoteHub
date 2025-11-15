package com.social_media.myproject.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
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
    private String video;

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

    @OneToMany(mappedBy = "twit", cascade = CascadeType.ALL)
    private List<Like> likes = new ArrayList<>();

    @OneToMany(mappedBy = "twit", cascade = CascadeType.ALL)
    private List<TwitRetwitUser> retwits = new ArrayList<>();
}
