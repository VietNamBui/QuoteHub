package com.social_media.myproject.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LabelSummaryDto {
    private Long id;
    private String name;
    private int quotesCount;
}
