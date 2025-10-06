package com.social_media.myproject.dto;

import lombok.Data;

@Data
public class LikeDto {
	
	private Long id;
	private UserDto user;
	private TwitDto twit;
	

}
