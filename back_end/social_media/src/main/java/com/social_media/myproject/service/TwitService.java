package com.social_media.myproject.service;

import java.util.List;

import com.social_media.myproject.dto.BookTrendDto;
import com.social_media.myproject.dto.FriendBookTrendDto;
import com.social_media.myproject.exception.TwitException;
import com.social_media.myproject.exception.UserException;
import com.social_media.myproject.model.Twit;
import com.social_media.myproject.model.User;
import com.social_media.myproject.request.TwitReplyReques;

public interface TwitService {
	
	public Twit createTwit(Twit req, User user) throws UserException;
	public List<Twit> findAllTwit(User currentUser);
	public Twit retwit(Long twitId, User user) throws UserException, TwitException;
	public Twit findById(Long twitId) throws TwitException;
	
	public void deleteTwitById(Long twitId, Long userId) throws TwitException, UserException;
	
	public Twit removeFromRetwit(Long twitId, User user) throws TwitException, UserException;
	
	public Twit createdReply(TwitReplyReques req, User user) throws TwitException;
	
	public List<Twit>getUserTwit(User user);
	
	public List<Twit> findByLikesContainsUser(User user);
	
	// Replies của user
	public List<Twit> getUserReplies(User user);

	// Update
	public Twit updateTwitContent(Long twitId, String content, Long quoteId, User currentUser) throws TwitException, UserException;

	// Trending
	List<BookTrendDto> getTrendingBooks();
	List<FriendBookTrendDto> getFriendsTrendingBooks(User currentUser);

}
