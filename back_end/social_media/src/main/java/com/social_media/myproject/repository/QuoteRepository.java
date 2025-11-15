package com.social_media.myproject.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.social_media.myproject.model.Book;
import com.social_media.myproject.model.Quote;
import com.social_media.myproject.model.User;

@Repository
public interface QuoteRepository extends JpaRepository<Quote, Long> {
	
    boolean existsByHighlightAndBookAndPositionTypeAndPositionValueAndUser(
            String highlight, Book book, String positionType, int positionValue, User user
        );
	
}
