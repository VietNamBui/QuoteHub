package com.social_media.myproject.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class UserDto {
	
	private Long id;
	private String fullName;
	private String email;
	private String image;
	private String backgroundImage;
	private boolean req_user;
	private boolean admin;
	
	private List<UserDto> followers = new ArrayList<>();
	private List<UserDto> following = new ArrayList<>();
	
	private boolean followed;
	
	private boolean isVerified;
	
	
	
	
}
