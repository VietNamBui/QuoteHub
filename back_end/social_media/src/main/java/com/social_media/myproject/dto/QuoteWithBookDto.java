package com.social_media.myproject.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuoteWithBookDto {
    private Long id;
    private String highlight;
    private String positionType;
    private Integer positionValue;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
}
