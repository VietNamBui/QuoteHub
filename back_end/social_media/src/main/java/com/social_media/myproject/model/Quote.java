package com.social_media.myproject.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

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

    @ManyToMany
    @JoinTable(
        name = "label_quote",
        joinColumns = @JoinColumn(name = "quote_id"),
        inverseJoinColumns = @JoinColumn(name = "label_id")
    )
    @Builder.Default
    @JsonIgnore
    private List<Label> labels = new ArrayList<>();
    
    @ManyToOne
    @JoinColumn(name = "book_id")  
    private Book book;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @OneToMany(mappedBy = "quote", cascade = CascadeType.ALL)
    private List<Twit> twits = new ArrayList<>();
    
    
    
}
