package com.social_media.myproject.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.social_media.myproject.model.Book;
import com.social_media.myproject.model.User;

public interface BookRepository extends JpaRepository<Book, Long> {
	Optional<Book> findByTitleAndAuthor(String title, String author);

	List<Book> findByUser(User user);

	Optional<Book> findByUserAndTitleAndAuthor(User user, String title, String author);

	Optional<Book> findByIdAndUser(Long id, User user);
}
