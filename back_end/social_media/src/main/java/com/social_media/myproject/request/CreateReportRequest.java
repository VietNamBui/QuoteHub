package com.social_media.myproject.request;

import lombok.Data;

@Data
public class CreateReportRequest {

    private Long twitId;
    private String reason;
}
