package com.social_media.myproject.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.social_media.myproject.exception.UserException;
import com.social_media.myproject.model.Book;
import com.social_media.myproject.model.User;
import com.social_media.myproject.repository.BookRepository;
import com.social_media.myproject.service.AIClassificationService;
import com.social_media.myproject.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookRepository bookRepository;
    private final UserService userService;
    private final AIClassificationService aiService;

    @PostMapping("/{bookId}/ai-enrich")
    public ResponseEntity<?> enrichBookWithAI(
            @PathVariable Long bookId,
            @RequestHeader("Authorization") String jwt
    ) throws UserException {

        User user = userService.findUserProfileByJwt(jwt);

        Book book = bookRepository.findByIdAndUser(bookId, user)
                .orElseThrow(() -> new RuntimeException("Book not found or you are not allowed to enrich it"));

        String json = aiService.enrichBookMetadata(book.getTitle(), book.getAuthor());
        if (json == null || json.isBlank()) {
            return ResponseEntity.status(502).body("AI service did not return any metadata");
        }

        book.setAiMetadata(json);
        bookRepository.save(book);

        return ResponseEntity.ok(json);
    }
}
