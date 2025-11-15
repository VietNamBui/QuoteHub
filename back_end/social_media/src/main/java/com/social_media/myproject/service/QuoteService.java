package com.social_media.myproject.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.social_media.myproject.model.Label;
import com.social_media.myproject.model.Quote;
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
}
