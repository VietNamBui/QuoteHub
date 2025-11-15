package com.social_media.myproject.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.social_media.myproject.model.Quote;
import com.social_media.myproject.repository.QuoteRepository;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ClippingService {

    private final QuoteRepository quoteRepository;

    public ClippingService(QuoteRepository quoteRepository) {
        this.quoteRepository = quoteRepository;
    }

    public List<Quote> parseClippings(MultipartFile file) {
        List<Quote> quotes = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) {
                if (line.trim().equals("==========")) {
                    Quote quote = parseSingleQuote(sb.toString());
                    if (quote != null) {
                        quotes.add(quoteRepository.save(quote));
                    }
                    sb.setLength(0);
                } else {
                    sb.append(line).append("\n");
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return quotes;
    }

    private Quote parseSingleQuote(String raw) {
        try {
            // Regex linh hoạt: nhận cả "Location" hoặc "Page"
            Pattern pattern = Pattern.compile(
                    "^(.*?)\\s*-\\s*(.*?)\\n- Your Highlight on (Page|Location) ([^|]+) \\| Added on (.*?)\\n\\n(.*?)$",
                    Pattern.DOTALL
            );
            Matcher matcher = pattern.matcher(raw.trim());

            if (matcher.find()) {
                String bookTitle = matcher.group(1).trim();
                String author = matcher.group(2).trim();
                String positionType = matcher.group(3).trim().toLowerCase(); // => "page" hoặc "location"
                String positionValue = matcher.group(4).trim();
                String dateAdded = matcher.group(5).trim();
                String highlight = matcher.group(6).trim();

                return Quote.builder()
                        .bookTitle(bookTitle)
                        .author(author)
                        .highlight(highlight)
                        .positionType(positionType)
                        .positionValue(positionValue)
                        .dateAdded(dateAdded)
                        .build();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}