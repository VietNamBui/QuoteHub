package com.social_media.myproject.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.social_media.myproject.model.Book;

public interface BookRepository extends JpaRepository<Book, Long> {
	Optional<Book> findByTitleAndAuthor(String title, String author);
}
