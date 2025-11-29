package com.social_media.myproject.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeaturedUserDto {

    private Long id;
    private String fullName;
    private String email;
    private String image;

    private long followersCount;
    private long totalLikes;
}
