package com.social_media.myproject.service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.social_media.myproject.model.Book;
import com.social_media.myproject.model.Label;
import com.social_media.myproject.model.Label;
import com.social_media.myproject.model.Label;
import com.social_media.myproject.model.Quote;
import com.social_media.myproject.model.User;
import com.social_media.myproject.repository.LabelRepository;
import com.social_media.myproject.repository.QuoteRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QuoteService {

    private final QuoteRepository quoteRepository;
    private final LabelRepository labelRepository;
    private final AIClassificationService aiService;

    @Transactional
    public void classifyQuotes(List<Long> quoteIds) {
        List<Quote> quotes = quoteRepository.findAllById(quoteIds);

        for (Quote q : quotes) {
            // Gọi AI service để phân loại
            List<String> labelsFromAI = aiService.classify(q.getHighlight());

            for (String labelName : labelsFromAI) {
                Label label = labelRepository.findByName(labelName)
                        .orElseGet(() -> labelRepository.save(Label.builder().name(labelName).build()));

                if (!q.getLabels().contains(label)) {
                    q.getLabels().add(label);
                }
                if (!label.getQuotes().contains(q)) {
                    label.getQuotes().add(q);
                }
            }

            quoteRepository.save(q);
        }
    }

    public Set<Book> getBooksOfUser(User user) {
        List<Quote> quotes = quoteRepository.findByUser(user);
        return quotes.stream()
                .map(Quote::getBook)
                .filter(b -> b != null)
                .collect(Collectors.toSet());
    }

    public List<Quote> getQuotesOfBookForUser(User user, Book book) {
        if (book == null || book.getQuotes() == null) {
            return List.of();
        }

        return book.getQuotes().stream()
                .filter(q -> q.getUser() != null && q.getUser().getId().equals(user.getId()))
                .collect(Collectors.toList());
    }

    public List<Quote> getQuotesOfUser(User user) {
        return quoteRepository.findByUser(user);
    }

    public List<Quote> getUnclassifiedQuotesOfUser(User user) {
        return quoteRepository.findByUserAndLabelsIsEmpty(user);
    }

    public List<Quote> getQuotesOfLabelForUser(Label label, User user) {
        if (label == null || label.getQuotes() == null) {
            return List.of();
        }
        return label.getQuotes().stream()
                .filter(q -> q.getUser() != null && q.getUser().getId().equals(user.getId()))
                .collect(Collectors.toList());
    }
}
