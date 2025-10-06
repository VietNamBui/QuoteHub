package com.social_media.myproject.dto.mapper;

import java.util.ArrayList;
import java.util.List;

import com.social_media.myproject.dto.UserDto;
import com.social_media.myproject.model.User;

public class UserDtoMapper {
	
	public static UserDto toUserDto(User user) {
		UserDto userDto = new UserDto();
		userDto.setId(user.getId());
		userDto.setEmail(user.getEmail());
		userDto.setFullName(user.getFullName());
		userDto.setImage(user.getImage());
		userDto.setBackgroundImage(user.getBackgroundImage());
		userDto.setBio(user.getBio());
		userDto.setBirthDate(user.getBirthDate());
		userDto.setFollowers(toUserDtos(user.getFollowers()));
		return userDto;
	}

	private static List<UserDto> toUserDtos(List<User> followers) {
		List<UserDto> userDtos = new ArrayList<>();
		
		for(User user:followers) {
			User 
		}
		
		
		
		return null;
	}
	
	
}
