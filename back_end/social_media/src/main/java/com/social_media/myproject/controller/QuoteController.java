package com.social_media.myproject.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.social_media.myproject.model.Label;
import com.social_media.myproject.model.Quote;
import com.social_media.myproject.repository.LabelRepository;
import com.social_media.myproject.repository.QuoteRepository;
import com.social_media.myproject.service.AIClassificationService;
import com.social_media.myproject.service.QuoteService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/quotes")
@RequiredArgsConstructor
public class QuoteController {
	
    private final QuoteService quoteService;

    @PostMapping("/classify")
    public ResponseEntity<?> classifyQuotes(@RequestBody Map<String, List<Long>> payload) {
        List<Long> quoteIds = payload.get("quoteIds");
        if (quoteIds == null || quoteIds.isEmpty()) {
            return ResponseEntity.badRequest().body("quoteIds không được rỗng");
        }

        quoteService.classifyQuotes(quoteIds);

        return ResponseEntity.ok("Phân loại thành công");
    }

}

