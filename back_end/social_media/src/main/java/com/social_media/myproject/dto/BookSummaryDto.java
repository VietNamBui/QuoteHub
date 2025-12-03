package com.social_media.myproject.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BookSummaryDto {
    private Long id;
    private String title;
    private String author;
    private int quotesCount;
    private String aiMetadata;
}
