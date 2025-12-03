package com.social_media.myproject.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "LONGTEXT")  
    private String highlight;

    private String positionType;
    private Integer positionValue;

    @ManyToOne
    @JoinColumn(name = "book_id")  
    private Book book;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @OneToMany(mappedBy = "quote")
    private List<Twit> twits = new ArrayList<>();
    
    
    
}
