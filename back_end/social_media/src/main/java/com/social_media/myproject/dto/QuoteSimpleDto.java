package com.social_media.myproject.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class QuoteSimpleDto {
    private Long id;
    private String highlight;
    private String positionType;
    private Integer positionValue;
}
