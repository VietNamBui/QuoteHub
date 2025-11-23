package com.social_media.myproject.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class TwitRetwitUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "twit_id")
    private Twit twit;

    @ManyToOne
    @JoinColumn(name = "retwit_user_id")
    private User user;
}
