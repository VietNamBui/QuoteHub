package com.social_media.myproject.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.social_media.myproject.dto.LabelSummaryDto;
import com.social_media.myproject.dto.QuoteWithBookDto;
import com.social_media.myproject.exception.UserException;
import com.social_media.myproject.model.Label;
import com.social_media.myproject.model.Quote;
import com.social_media.myproject.model.User;
import com.social_media.myproject.repository.LabelRepository;
import com.social_media.myproject.service.QuoteService;
import com.social_media.myproject.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/labels")
@RequiredArgsConstructor
public class LabelController {

    private final LabelRepository labelRepository;
    private final UserService userService;
    private final QuoteService quoteService;

    @Autowired
    public LabelController(LabelRepository labelRepository, UserService userService, QuoteService quoteService) {
        this.labelRepository = labelRepository;
        this.userService = userService;
        this.quoteService = quoteService;
    }

    @GetMapping
    public List<Label> getAll() {
        return labelRepository.findAll();
    }

    @PostMapping
    public Label create(@RequestBody Label label) {
        return labelRepository.save(label);
    }

    // Danh sách label của current user với số lượng quote
    @GetMapping("/me")
    public ResponseEntity<List<LabelSummaryDto>> getLabelsOfCurrentUser(
            @RequestHeader("Authorization") String jwt
    ) throws UserException {
        User user = userService.findUserProfileByJwt(jwt);

        List<Label> allLabels = labelRepository.findAll();

        List<LabelSummaryDto> result = allLabels.stream()
                .map(label -> {
                    long count = label.getQuotes().stream()
                            .filter(q -> q.getUser() != null && q.getUser().getId().equals(user.getId()))
                            .count();
                    return new LabelSummaryDto(label.getId(), label.getName(), (int) count);
                })
                .filter(dto -> dto.getQuotesCount() > 0)
                .collect(Collectors.toList());

        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    // Danh sách quote thuộc 1 label cho current user
    @GetMapping("/{labelId}/quotes")
    public ResponseEntity<List<QuoteWithBookDto>> getQuotesOfLabelForCurrentUser(
            @PathVariable Long labelId,
            @RequestHeader("Authorization") String jwt
    ) throws UserException {
        User user = userService.findUserProfileByJwt(jwt);
        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new RuntimeException("Label not found with id " + labelId));

        List<Quote> quotes = quoteService.getQuotesOfLabelForUser(label, user);

        List<QuoteWithBookDto> result = quotes.stream()
                .map(q -> new QuoteWithBookDto(
                        q.getId(),
                        q.getHighlight(),
                        q.getPositionType(),
                        q.getPositionValue(),
                        q.getBook() != null ? q.getBook().getId() : null,
                        q.getBook() != null ? q.getBook().getTitle() : null,
                        q.getBook() != null ? q.getBook().getAuthor() : null
                ))
                .collect(Collectors.toList());

        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}