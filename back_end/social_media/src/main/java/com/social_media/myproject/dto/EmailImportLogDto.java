package com.social_media.myproject.dto;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailImportLogDto {

    private Long id;
    private String senderEmail;
    private String recipient;
    private String subject;
    private String fileName;
    private Instant receivedAt;
}
