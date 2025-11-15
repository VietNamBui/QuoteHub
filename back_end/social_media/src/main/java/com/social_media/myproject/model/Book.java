package com.social_media.myproject.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.CascadeType;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
    private String title;

    private String author;
    
    private int year;
    
    @OneToMany(mappedBy = "book", cascade = { CascadeType.ALL }, orphanRemoval = true)
    @JsonIgnoreProperties("book")
    @Builder.Default
    private List<Quote> quotes = new ArrayList<>();
    
    
    

}
