package com.social_media.myproject.dto;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ManualImportLogDto {

    private Long id;
    private String fileName;
    private Instant importedAt;
}
