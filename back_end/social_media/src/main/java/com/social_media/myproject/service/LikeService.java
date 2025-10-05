package com.social_media.myproject.service;

import java.util.List;

import com.social_media.myproject.exception.TwitException;
import com.social_media.myproject.exception.UserException;
import com.social_media.myproject.model.Like;
import com.social_media.myproject.model.User;

public interface LikeService {
	
	public Like likeTwit(Long twitId, User user) throws UserException, TwitException;
	
	public List<Like> getAllLikes(Long twitId) throws TwitException;
	
	
}
 