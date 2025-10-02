package com.social_media.myproject.request;

import java.time.LocalDateTime;

import lombok.Data;

public class TwitReplyReques {
	
	@Data
	private String content;
	private Long twitId;
	private LocalDateTime createdAt;
	private String image;

}
