package com.social_media.myproject.controller;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.social_media.myproject.dto.BookSummaryDto;
import com.social_media.myproject.dto.QuoteSimpleDto;
import com.social_media.myproject.dto.QuoteWithBookDto;
import com.social_media.myproject.exception.UserException;
import com.social_media.myproject.model.Book;
import com.social_media.myproject.model.Quote;
import com.social_media.myproject.model.User;
import com.social_media.myproject.repository.BookRepository;
import com.social_media.myproject.service.QuoteService;
import com.social_media.myproject.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/quotes")
@RequiredArgsConstructor
public class QuoteController {
	
    private final QuoteService quoteService;
    private final UserService userService;
    private final BookRepository bookRepository;

    @GetMapping("/books/me")
    public ResponseEntity<List<BookSummaryDto>> getBooksOfCurrentUser(@RequestHeader("Authorization") String jwt)
            throws UserException {
        User user = userService.findUserProfileByJwt(jwt);
        Set<Book> books = quoteService.getBooksOfUser(user);

        List<BookSummaryDto> result = books.stream()
                .map(b -> {
                    // Đếm số quote của CHÍNH user này cho từng book
                    int count = quoteService.getQuotesOfBookForUser(user, b).size();
                    return new BookSummaryDto(
                            b.getId(),
                            b.getTitle(),
                            b.getAuthor(),
                            count,
                            b.getAiMetadata()
                    );
                })
                .collect(Collectors.toList());

        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<QuoteSimpleDto>> getQuotesOfBookForCurrentUser(
            @PathVariable Long bookId,
            @RequestHeader("Authorization") String jwt
    ) throws UserException {
        User user = userService.findUserProfileByJwt(jwt);
        Book book = bookRepository.findByIdAndUser(bookId, user)
                .orElseThrow(() -> new RuntimeException("Book not found with id " + bookId));
        List<Quote> quotes = quoteService.getQuotesOfBookForUser(user, book);

        List<QuoteSimpleDto> result = quotes.stream()
                .map(q -> new QuoteSimpleDto(
                        q.getId(),
                        q.getHighlight(),
                        q.getPositionType(),
                        q.getPositionValue()
                ))
                .collect(Collectors.toList());

        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/me")
    public ResponseEntity<List<QuoteSimpleDto>> getQuotesOfCurrentUser(@RequestHeader("Authorization") String jwt)
            throws UserException {
        User user = userService.findUserProfileByJwt(jwt);
        List<Quote> quotes = quoteService.getQuotesOfUser(user);

        List<QuoteSimpleDto> result = quotes.stream()
                .map(q -> new QuoteSimpleDto(
                        q.getId(),
                        q.getHighlight(),
                        q.getPositionType(),
                        q.getPositionValue()
                ))
                .collect(Collectors.toList());

        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @DeleteMapping("/{quoteId}")
    public ResponseEntity<?> deleteQuote(
            @PathVariable Long quoteId,
            @RequestHeader("Authorization") String jwt) throws UserException {
        User user = userService.findUserProfileByJwt(jwt);
        quoteService.deleteQuoteForUser(quoteId, user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/book/{bookId}")
    public ResponseEntity<?> deleteBookQuotes(
            @PathVariable Long bookId,
            @RequestHeader("Authorization") String jwt) throws UserException {
        User user = userService.findUserProfileByJwt(jwt);
        quoteService.deleteBookForUser(bookId, user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/books/{bookId}")
    public ResponseEntity<?> deleteBookAndAllQuotes(
            @PathVariable Long bookId,
            @RequestHeader("Authorization") String jwt) throws UserException {
        User user = userService.findUserProfileByJwt(jwt);
        quoteService.deleteBookAndQuotesForUser(bookId, user);
        return ResponseEntity.ok().build();
    }

}
